const express = require('express');
const { 
  getCartItems, 
  createOrder, 
  getUserOrders, 
  getAllOrders,
  clearCart,
  updateStock,
  getProductById
} = require('../models/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await getUserOrders(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order from cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Get cart items
    const cartItems = await getCartItems(req.user.id);
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock availability and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await getProductById(item.product_id);
      
      if (!product) {
        return res.status(400).json({ error: `Product ${item.name} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      total += item.price * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
    }

    // Create order
    const order = await createOrder(req.user.id, orderItems, total);

    // Update stock for each item
    for (const item of cartItems) {
      await updateStock(item.product_id, item.quantity);
    }

    // Clear cart
    await clearCart(req.user.id);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;