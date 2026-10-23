const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');
const demoInventoryConfig = require('../config/demoInventory');
const {
  processDueRestorations
} = require('../services/demoInventoryService');

// Restore stock reservations if an order cannot be saved.
const rollbackStock = async (reservedItems) => {
  for (const item of reservedItems) {
    await Product.updateOne(
      { _id: item.productId },
      [
        {
          $set: {
            stock: {
              $add: [
                { $ifNull: ['$stock', 0] },
                item.qty
              ]
            },
            restockAt: {
              $cond: [
                {
                  $gt: [
                    {
                      $add: [
                        { $ifNull: ['$stock', 0] },
                        item.qty
                      ]
                    },
                    0
                  ]
                },
                null,
                '$restockAt'
              ]
            }
          }
        }
      ]
    );
  }
};

const addOrderItems = async (req, res) => {
  // Track every successful stock deduction so it can be rolled back
  // if a later deduction or order save fails.
  const reservedItems = [];

  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Please log in again to place your order.'
      });
    }

    const { items, address, paymentId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'No order items provided.'
      });
    }

    const requiredAddressFields = [
      'fullName',
      'street',
      'city',
      'postalCode',
      'country'
    ];

    if (
      !address ||
      requiredAddressFields.some(
        (field) =>
          typeof address[field] !== 'string' ||
          !address[field].trim()
      )
    ) {
      return res.status(400).json({
        message: 'Please provide a complete shipping address.'
      });
    }

    // Validate IDs and quantities, combining duplicate product entries.
    const quantitiesByProduct = new Map();

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId)) {
        return res.status(400).json({
          message: 'An order item has an invalid product ID.'
        });
      }

      const qty = Number(item.qty);

      if (!Number.isSafeInteger(qty) || qty < 1) {
        return res.status(400).json({
          message: 'Each item must have a valid positive quantity.'
        });
      }

      const productId = String(item.productId);
      const combinedQty =
        (quantitiesByProduct.get(productId) || 0) + qty;

      if (!Number.isSafeInteger(combinedQty)) {
        return res.status(400).json({
          message: 'The requested quantity is too large.'
        });
      }

      quantitiesByProduct.set(productId, combinedQty);
    }

    // Process deadlines before checking availability.
    await processDueRestorations();

    const productIds = [...quantitiesByProduct.keys()];

    const products = await Product.find({
      _id: { $in: productIds },
      isDemoHidden: { $ne: true }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: 'One or more products are no longer available.'
      });
    }

    // Check prices and current stock before making any deductions.
    let totalAmount = 0;

    const productById = new Map(
      products.map((product) => [
        String(product._id),
        product
      ])
    );

    for (const [productId, qty] of quantitiesByProduct) {
      const product = productById.get(productId);

      const price = Number(product.price);
      const stock = Number(product.stock);

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isSafeInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          message: `Invalid price or stock for ${product.name}.`
        });
      }

      if (qty > stock) {
        return res.status(409).json({
          message: `Only ${stock} unit(s) of ${product.name} are currently available.`
        });
      }

      totalAmount += price * qty;
    }

    totalAmount = Math.round(
      (totalAmount + Number.EPSILON) * 100
    ) / 100;

    // Deduct stock atomically. MongoDB only applies the deduction
    // if sufficient stock still exists at the moment of the update.
    // Sorting IDs makes reservation order consistent between requests.
    const sortedProductIds = [...quantitiesByProduct.keys()].sort();

    for (const productId of sortedProductIds) {
      const qty = quantitiesByProduct.get(productId);

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          isDemoHidden: { $ne: true },
          stock: { $gte: qty }
        },
        {
          $inc: { stock: -qty }
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedProduct) {
        await rollbackStock(reservedItems);
        reservedItems.length = 0;

        return res.status(409).json({
          message: 'Stock changed while placing your order. Please refresh your cart and try again.'
        });
      }

      reservedItems.push({
        productId: updatedProduct._id,
        qty
      });

      // Start the countdown only when a demo product has actually
      // reached zero. The conditional update prevents repeated
      // requests from resetting an existing deadline.
      if (
        demoInventoryConfig.enabled &&
        updatedProduct.isDemoProduct &&
        updatedProduct.stock === 0 &&
        Number(updatedProduct.initialStock) > 0
      ) {
        await Product.updateOne(
          {
            _id: updatedProduct._id,
            stock: 0,
            restockAt: null,
            isDemoHidden: { $ne: true }
          },
          {
            $set: {
              restockAt: new Date(
                Date.now() + demoInventoryConfig.restockDelayMs
              )
            }
          }
        );
      }
    }

    const verifiedItems = sortedProductIds.map((productId) => {
      const product = productById.get(productId);

      return {
        productId: product._id,
        qty: quantitiesByProduct.get(productId),
        price: Number(product.price)
      };
    });

    const order = new Order({
      userId: req.user._id,
      items: verifiedItems,
      totalAmount,
      address: {
        fullName: address.fullName.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim()
      },
      paymentId:
        typeof paymentId === 'string' ? paymentId : undefined
    });

    const createdOrder = await order.save();

    // The order is now saved, so do not roll back stock because
    // a confirmation email fails.
    reservedItems.length = 0;

    try {
      const escapeHtml = (value) =>
        String(value || '').replace(/[&<>"']/g, (character) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[character]);

      await sendEmail({
        email: req.user.email,
        subject: 'ShopStop - Order Confirmation',
        message: `
          <h2>Order Confirmation</h2>
          <p>Hello ${escapeHtml(req.user.name || 'Customer')},</p>
          <p>Your order has been placed. Order ID:
          <strong>${escapeHtml(createdOrder._id)}</strong></p>
          <p>Order total: ₹${totalAmount.toFixed(2)}</p>
          <p>Shipping address:
          ${escapeHtml(address.street.trim())},
          ${escapeHtml(address.city.trim())}</p>
          <p>Thank you for shopping with ShopStop!</p>
        `
      });
    } catch (emailError) {
      console.error(
        'Order confirmation email failed:',
        emailError.message
      );
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order failed:', error.message);

    if (reservedItems.length > 0) {
      try {
        await rollbackStock(reservedItems);
      } catch (rollbackError) {
        console.error(
          'Stock rollback failed; manual reconciliation may be needed:',
          rollbackError.message
        );
      }
    }

    return res.status(500).json({
      message: 'Unable to create the order.'
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'id name')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.'
      });
    }

    const allowedStatuses = [
      'Pending',
      'Shipped',
      'Delivered'
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: 'Invalid order status.'
      });
    }

    order.status = req.body.status;

    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus
};