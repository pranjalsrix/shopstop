const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const DEMO_ADMIN = {
  name: 'ShopStop Demo Admin',
  email: 'admin@shopnest.com',
  password: 'password123',
  role: 'admin'
};

const demoProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound with active noise cancellation, rich bass and all-day comfort.',
    price: 2999,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.8,
    numReviews: 24
  },
  {
    name: 'Minimalist Modern Chair',
    description: 'A stylish, comfortable accent chair designed for contemporary living spaces.',
    price: 7499,
    category: 'Furniture',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.2,
    numReviews: 12
  },
  {
    name: 'Professional DSLR Camera',
    description: 'Capture detailed photos with a versatile camera built for creative photography.',
    price: 64999,
    category: 'Electronics',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.9,
    numReviews: 50
  },
  {
    name: 'Classic White Sneakers',
    description: 'Versatile everyday sneakers with a clean silhouette and comfortable fit.',
    price: 2499,
    category: 'Clothing',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.5,
    numReviews: 89
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track daily activity, workouts and sleep with a sleek everyday smartwatch.',
    price: 4999,
    category: 'Electronics',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.6,
    numReviews: 37
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Enjoy room-filling sound in a compact speaker made for home and travel.',
    price: 1999,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.4,
    numReviews: 31
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'A responsive mechanical keyboard with a clean layout for gaming and work.',
    price: 3499,
    category: 'Electronics',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.7,
    numReviews: 42
  },
  {
    name: 'Ergonomic Office Desk',
    description: 'A spacious modern desk designed for focused work and a tidy home office.',
    price: 8999,
    category: 'Furniture',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.5,
    numReviews: 19
  },
  {
    name: 'Soft Lounge Sofa',
    description: 'A contemporary sofa with generous seating and a relaxed, inviting profile.',
    price: 28999,
    category: 'Furniture',
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.6,
    numReviews: 28
  },
  {
    name: 'Oak Finish Coffee Table',
    description: 'A versatile coffee table with a warm wood finish for modern living rooms.',
    price: 5499,
    category: 'Furniture',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.3,
    numReviews: 16
  },
  {
    name: 'Everyday Running Shoes',
    description: 'Lightweight running shoes designed for daily walks, training and casual wear.',
    price: 3299,
    category: 'Clothing',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.5,
    numReviews: 54
  },
  {
    name: 'Classic Denim Jacket',
    description: 'A timeless denim layer that pairs easily with everyday casual outfits.',
    price: 2799,
    category: 'Clothing',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.4,
    numReviews: 26
  },
  {
    name: 'Everyday Travel Backpack',
    description: 'A practical backpack with room for daily essentials, work gear and short trips.',
    price: 1899,
    category: 'Accessories',
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.6,
    numReviews: 33
  },
  {
    name: 'Leather-Style Wallet',
    description: 'A slim everyday wallet with organized card slots and a minimalist design.',
    price: 899,
    category: 'Accessories',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.2,
    numReviews: 14
  },
  {
    name: 'Polarized Sunglasses',
    description: 'Modern everyday sunglasses with a versatile frame and classic styling.',
    price: 1499,
    category: 'Accessories',
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.5,
    numReviews: 21
  },
  {
    name: 'Ceramic Table Lamp',
    description: 'A warm accent lamp that brings soft lighting to bedside tables and desks.',
    price: 2199,
    category: 'Home & Living',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.4,
    numReviews: 18
  },
  {
    name: 'Minimalist Wall Clock',
    description: 'A simple modern wall clock designed to complement a range of interiors.',
    price: 1299,
    category: 'Home & Living',
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.1,
    numReviews: 11
  },
  {
    name: 'Insulated Water Bottle',
    description: 'A reusable bottle for keeping drinks handy at work, the gym or on the go.',
    price: 799,
    category: 'Home & Living',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.6,
    numReviews: 39
  },
  {
    name: 'Premium Coffee Maker',
    description: 'A countertop coffee maker for a convenient, comforting daily coffee routine.',
    price: 5999,
    category: 'Home & Living',
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.7,
    numReviews: 45
  },
  {
    name: 'Wireless Computer Mouse',
    description: 'A compact wireless mouse with a comfortable shape for work and everyday browsing.',
    price: 1199,
    category: 'Electronics',
    stock: 27,
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1080&q=80',
    ratings: 4.3,
    numReviews: 23
  }
];

const importData = async () => {
  try {
    await connectDB();

    // Create the demo admin only if it doesn't exist.
    // Existing users and passwords are preserved.
    const existingAdmin = await User.findOne({
      email: DEMO_ADMIN.email
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        DEMO_ADMIN.password,
        10
      );

      await User.create({
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        password: hashedPassword,
        role: DEMO_ADMIN.role
      });

      console.log('Demo admin created.');
    } else {
      console.log('Demo admin already exists; left unchanged.');
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const productData of demoProducts) {
      const filter = {
        name: productData.name,
        category: productData.category
      };

      // Preserve the existing product ID and current inventory.
      const existingProduct = await Product.findOne(filter);

      if (existingProduct) {
        const wasAlreadyDemo = existingProduct.isDemoProduct === true;

        existingProduct.isDemoProduct = true;
        existingProduct.initialStock = productData.stock;

        // Only fill in missing metadata; do not reset a running timer.
        if (existingProduct.isDemoHidden === undefined) {
          existingProduct.isDemoHidden = false;
        }

        if (existingProduct.restoreAt === undefined) {
          existingProduct.restoreAt = null;
        }

        // Preserve stock and restockAt for existing demo products.
        // For older products not previously marked as demo products,
        // keep current stock and leave restockAt unchanged.
        if (!wasAlreadyDemo && existingProduct.stock > 0) {
          existingProduct.restockAt = null;
        }

        // Update descriptive/demo content without changing the ID.
        existingProduct.description = productData.description;
        existingProduct.price = productData.price;
        existingProduct.imageUrl = productData.imageUrl;
        existingProduct.ratings = productData.ratings;
        existingProduct.numReviews = productData.numReviews;

        await existingProduct.save();
        updatedCount++;
      } else {
        await Product.create({
          ...productData,
          isDemoProduct: true,
          initialStock: productData.stock,
          restockAt: null,
          isDemoHidden: false,
          restoreAt: null
        });

        insertedCount++;
      }
    }

    console.log('✅ Demo inventory seed completed.');
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products added: ${insertedCount}`);
    console.log(`Total demo products in seed list: ${demoProducts.length}`);
    console.log('Existing product IDs, users, and orders were preserved.');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

importData();