const sqlite3 = require('sqlite3').verbose();
const { rejects } = require('assert');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
        console.log('Users table created');
    });

    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating products table:', err);
        reject(err);
        return;
      }
      console.log('Products table created');
    });

    // Cart items table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating cart_items table:', err);
        reject(err);
        return;
      }
      console.log('Cart items table created');
    });

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating orders table:', err);
        reject(err);
        return;
      }
      console.log('Orders table created');
    });

    console.log('Database initialized');
  });
};

// User operations
const createUser = (user) => {
  return new Promise((resolve, reject) => {
    const { email, password, name, role = 'user' } = user;
    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, password, name, role],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, email, name, role });
      }
    );
  });
};

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, name, role FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Product operations
const getAllProducts = (limit = 20, offset = 0) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createProduct = (product) => {
  return new Promise((resolve, reject) => {
    const { name, price, stock, description, image_url } = product;
    db.run(
      'INSERT INTO products (name, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, price, stock, description, image_url],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...product });
      }
    );
  });
};

const updateProduct = (id, product) => {
  return new Promise((resolve, reject) => {
    const { name, price, stock, description, image_url } = product;
    db.run(
      'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, image_url = ? WHERE id = ?',
      [name, price, stock, description, image_url, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...product });
      }
    );
  });
};

const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ deleted: this.changes > 0 });
    });
  });
};

// Cart operations
const getCartItems = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const addToCart = (userId, productId, quantity = 1) => {
  return new Promise((resolve, reject) => {
    // Check if item already exists in cart
    db.get(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Update quantity
          db.run(
            'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
            [quantity, row.id],
            function(err) {
              if (err) reject(err);
              else resolve({ id: row.id, quantity: row.quantity + quantity });
            }
          );
        } else {
          // Insert new item
          db.run(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [userId, productId, quantity],
            function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID, user_id: userId, product_id: productId, quantity });
            }
          );
        }
      }
    );
  });
};

const updateCartItem = (userId, itemId, quantity) => {
  return new Promise((resolve, reject) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      db.run(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [itemId, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: true });
        }
      );
    } else {
      db.run(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, itemId, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ id: itemId, quantity });
        }
      );
    }
  });
};

const clearCart = (userId) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
      if (err) reject(err);
      else resolve({ cleared: this.changes });
    });
  });
};

// Order operations
const createOrder = (userId, items, total) => {
  return new Promise((resolve, reject) => {
    const itemsJson = JSON.stringify(items);
    db.run(
      'INSERT INTO orders (user_id, total, items) VALUES (?, ?, ?)',
      [userId, total, itemsJson],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, user_id: userId, total, status: 'pending' });
      }
    );
  });
};

const getUserOrders = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else {
          // Parse items JSON
          const orders = rows.map(order => ({
            ...order,
            items: JSON.parse(order.items)
          }));
          resolve(orders);
        }
      }
    );
  });
};

const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `, (err, rows) => {
      if (err) reject(err);
      else {
        const orders = rows.map(order => ({
          ...order,
          items: JSON.parse(order.items)
        }));
        resolve(orders);
      }
    });
  });
};

const updateStock = (productId, quantity) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity],
      function(err) {
        if (err) reject(err);
        else resolve({ updated: this.changes > 0 });
      }
    );
  });
};

module.exports = {
  db,
  initDatabase,
  createUser,
  findUserByEmail,
  findUserById,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCartItems,
  addToCart,
  updateCartItem,
  clearCart,
  createOrder,
  getUserOrders,
  getAllOrders,
  updateStock
};