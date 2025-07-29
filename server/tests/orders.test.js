const request = require('supertest');
const { app } = require('../server');

describe('Orders Endpoints', () => {
  let userToken;
  let adminToken;
  let productId;

  beforeAll(async () => {
    // Create user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Order User',
        email: 'order@test.com',
        password: 'order123'
      });
    userToken = userResponse.body.token;

    // Create admin
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Order Admin',
        email: 'orderadmin@test.com',
        password: 'admin123'
      });
    adminToken = adminResponse.body.token;

    // Create a product
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Order Test Product',
        price: 25.00,
        stock: 50,
        description: 'Product for order testing'
      });
    
    productId = productResponse.body.product.id;
  });

  describe('GET /api/orders', () => {
    it('should get empty orders initially', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.orders).toEqual([]);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/orders')
        .expect(401);
    });
  });

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Clear cart and add fresh item
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        });
    });

    it('should create order from cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.total).toBe(50.00); // 2 * 25.00
      expect(response.body.order.items.length).toBe(1);
    });

    it('should clear cart after order creation', async () => {
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(cartResponse.body.items).toEqual([]);
      expect(cartResponse.body.total).toBe(0);
    });

    it('should fail with empty cart', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should update product stock after order', async () => {
      // Add item to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 3
        });

      // Get current stock
      const productBefore = await request(app)
        .get(`/api/products/${productId}`);
      const stockBefore = productBefore.body.product.stock;

      // Create order
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      // Check stock after
      const productAfter = await request(app)
        .get(`/api/products/${productId}`);
      const stockAfter = productAfter.body.product.stock;

      expect(stockAfter).toBe(stockBefore - 3);
    });
  });

  describe('GET /api/orders (with orders)', () => {
    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.orders.length).toBeGreaterThan(0);
      expect(response.body.orders[0]).toHaveProperty('id');
      expect(response.body.orders[0]).toHaveProperty('total');
      expect(response.body.orders[0]).toHaveProperty('status');
      expect(response.body.orders[0]).toHaveProperty('items');
    });
  });

  describe('GET /api/orders/admin/all', () => {
    it('should get all orders as admin', async () => {
      const response = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.orders.length).toBeGreaterThan(0);
      expect(response.body.orders[0]).toHaveProperty('user_name');
      expect(response.body.orders[0]).toHaveProperty('user_email');
    });

    it('should reject regular user access', async () => {
      await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/orders/admin/all')
        .expect(401);
    });
  });

  describe('Order validation', () => {
    it('should prevent ordering out of stock items', async () => {
      // Create a product with low stock
      const lowStockProduct = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Low Stock Product',
          price: 10.00,
          stock: 1,
          description: 'Product with low stock'
        });

      // Try to add more than available
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: lowStockProduct.body.product.id,
          quantity: 5
        })
        .expect(400);
    });
  });
});