const Product = require('../models/Product');
const config = require('../config/demoInventory');

const getRestockDeadline = () =>
    new Date(Date.now() + config.restockDelayMs);

/**
 * Process demo products whose restoration deadline has passed.
 * Safe to call repeatedly; only overdue products are restored.
 */
const processDueRestorations = async () => {
    if (!config.enabled) {
        return;
    }

    const now = new Date();

    // Restore demo products that were temporarily hidden by the seller.
    await Product.updateMany(
        {
            isDemoProduct: true,
            isDemoHidden: true,
            restoreAt: { $ne: null, $lte: now }
        },
        {
            $set: {
                isDemoHidden: false,
                restoreAt: null
            }
        }
    );

    // Restock demo products whose countdown has expired.
    const dueProducts = await Product.find({
        isDemoProduct: true,
        isDemoHidden: { $ne: true },
        stock: 0,
        restockAt: { $ne: null, $lte: now },
        initialStock: { $gt: 0 }
    });

    for (const product of dueProducts) {
        await Product.updateOne(
            {
                _id: product._id,
                isDemoProduct: true,
                isDemoHidden: { $ne: true },
                stock: 0,
                restockAt: { $lte: now }
            },
            {
                $set: {
                    stock: product.initialStock,
                    restockAt: null
                }
            }
        );
    }
};


/**
 * Start the restock countdown once when a demo product reaches zero stock.
 */
const scheduleRestockIfNeeded = async (product) => {
    if (
        !config.enabled ||
        !product ||
        !product.isDemoProduct ||
        product.isDemoHidden ||
        product.stock !== 0 ||
        !product.initialStock ||
        product.restockAt
    ) {
        return product;
    }

    product.restockAt = getRestockDeadline();
    await product.save();

    return product;
};

/**
 * Temporarily hide a demo product instead of permanently deleting it.
 */
const temporarilyHideDemoProduct = async (product) => {
    if (!config.enabled || !product?.isDemoProduct) {
        return false;
    }

    product.isDemoHidden = true;
    product.restoreAt = getRestockDeadline();
    product.restockAt = null;

    await product.save();

    return true;
};

module.exports = {
    processDueRestorations,
    scheduleRestockIfNeeded,
    temporarilyHideDemoProduct
};