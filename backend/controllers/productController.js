const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const demoInventoryConfig = require('../config/demoInventory');
const {
  processDueRestorations,
  scheduleRestockIfNeeded,
  temporarilyHideDemoProduct
} = require('../services/demoInventoryService');

const getProducts = async (req, res) => {
  try {
    await processDueRestorations();

    const products = await Product.find({
      isDemoHidden: { $ne: true }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    await processDueRestorations();

    const product = await Product.findOne({
      _id: req.params.id,
      isDemoHidden: { $ne: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await scheduleRestockIfNeeded(product);

    return res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
      isDemoProduct: false,
      initialStock: null
    });

    const createdProduct = await product.save();

    return res.status(201).json(createdProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product || product.isDemoHidden) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined && price !== '') product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (stock !== undefined && stock !== '') {
      const newStock = Number(stock);

      if (!Number.isFinite(newStock) || newStock < 0) {
        return res.status(400).json({
          message: 'Stock must be a valid non-negative number.'
        });
      }

      product.stock = newStock;

      if (newStock > 0) {
        product.restockAt = null;
      } else if (product.isDemoProduct && demoInventoryConfig.enabled) {
        if (!product.restockAt && product.initialStock > 0) {
          product.restockAt = new Date(
            Date.now() + demoInventoryConfig.restockDelayMs
          );
        }
      } else {
        product.restockAt = null;
      }
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      product.imageUrl = result.secure_url;
    }

    const updatedProduct = await product.save();

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const hidden = await temporarilyHideDemoProduct(product);

    if (hidden) {
      return res.json({
        message: 'Demo product temporarily hidden and scheduled to return.',
        restoreAt: product.restoreAt
      });
    }

    await product.deleteOne();

    return res.json({ message: 'Product removed permanently.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};