const express = require('express');
const { 
  getCartItems, 
  addToCart, 
  updateCartItem, 
  clearCart,
  getProductById 
} = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await getCartItems(req.user.id);
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      items,
      total: parseFloat(total.toFixed(2)),
      count: items.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/items', authenticateToken, validateCartItem, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Check if product exists and has enough stock
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const cartItem = await addToCart(req.user.id, product_id, parseInt(quantity));
    
    res.status(201).json({
      message: 'Item added to cart',
      item: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const result = await updateCartItem(req.user.id, req.params.id, parseInt(quantity));
    
    res.json({
      message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated',
      item: result
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    await updateCartItem(req.user.id, req.params.id, 0);
    
    res.json({
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await clearCart(req.user.id);
    
    res.json({
      message: 'Cart cleared',
      cleared: result.cleared
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;