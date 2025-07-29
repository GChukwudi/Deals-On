const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('../models/database');

const seedData = async () => {
  try {
    // Initialize database
    console.log('🔄 Initializing database...');
    await initDatabase();

    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('Database initialized, seeding data...');
        resolve();
      }, 1000);
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@kenkeputa.com', adminPassword, 'Admin User', 'admin'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['user@test.com', userPassword, 'Test User', 'user'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Sample products
    const products = [
      {
        name: 'Smartphone X1',
        price: 599.99,
        stock: 50,
        description: 'Latest smartphone with advanced features',
        image_url: 'https://images.unsplash.com/photo-1726900303595-8c1f9250535f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Laptop Pro',
        price: 1299.99,
        stock: 25,
        description: 'High-performance laptop for professionals',
        image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Wireless Headphones',
        price: 199.99,
        stock: 100,
        description: 'Premium wireless headphones with noise cancellation',
        image_url: 'https://images.unsplash.com/photo-1691649485759-2ca657415fde?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Smart Watch',
        price: 299.99,
        stock: 75,
        description: 'Fitness tracking smartwatch with heart rate monitor',
        image_url: 'https://images.unsplash.com/photo-1637160151663-a410315e4e75?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Tablet Air',
        price: 449.99,
        stock: 40,
        description: '10-inch tablet perfect for work and entertainment',
        image_url: 'https://images.unsplash.com/photo-1682427286841-1f3ff788752b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Gaming Mouse',
        price: 79.99,
        stock: 150,
        description: 'High-precision gaming mouse with RGB lighting',
        image_url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'Bluetooth Speaker',
        price: 89.99,
        stock: 80,
        description: 'Portable bluetooth speaker with deep bass',
        image_url: 'https://images.unsplash.com/photo-1582978571763-2d039e56f0c3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        name: 'USB-C Cable',
        price: 19.99,
        stock: 200,
        description: 'Fast charging USB-C cable - 6ft length',
        image_url: 'https://images.unsplash.com/photo-1657181253444-66c4745d5a86?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }
    ];

    for (const product of products) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO products (name, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?)',
          [product.name, product.price, product.stock, product.description, product.image_url],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin login: admin@kenkeputa.com / admin123');
    console.log('👤 Test user login: user@test.com / user123');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    db.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;