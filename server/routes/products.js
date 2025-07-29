const express = require('express');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../models/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await getAllProducts(limit, offset);
    res.json({
      products,
      pagination: {
        limit,
        offset,
        count: products.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const { name, price, stock, description, image_url } = req.body;
    
    const product = await createProduct({
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description?.trim() || '',
      image_url: image_url?.trim() || ''
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const { name, price, stock, description, image_url } = req.body;
    
    // Check if product exists
    const existingProduct = await getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await updateProduct(req.params.id, {
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description?.trim() || '',
      image_url: image_url?.trim() || ''
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if product exists
    const existingProduct = await getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = await deleteProduct(req.params.id);
    
    if (result.deleted) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;