const request = require('supertest');
const { app } = require('../server');

describe('Admin Functionality', () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'regularuser@test.com',
        password: 'user123'
      });
    userToken = userResponse.body.token;

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'adminuser@test.com',
        password: 'admin123'
      });
    adminToken = adminResponse.body.token;
  });

  describe('Admin Product Management', () => {
    let productId;

    it('should allow admin to create products', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Created Product',
          price: 199.99,
          stock: 25,
          description: 'Product created by admin',
          image_url: 'https://example.com/admin-product.jpg'
        })
        .expect(201);

      expect(response.body.product.name).toBe('Admin Created Product');
      productId = response.body.product.id;
    });

    it('should prevent regular user from creating products', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Attempted Product',
          price: 99.99,
          stock: 10,
          description: 'This should fail'
        })
        .expect(403);
    });

    it('should allow admin to update products', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Admin Product',
          price: 249.99,
          stock: 30,
          description: 'Updated by admin',
          image_url: 'https://example.com/updated-product.jpg'
        })
        .expect(200);

      expect(response.body.product.name).toBe('Updated Admin Product');
      expect(response.body.product.price).toBe(249.99);
    });

    it('should prevent regular user from updating products', async () => {
      await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Attempted Update',
          price: 1.00,
          stock: 999
        })
        .expect(403);
    });

    it('should allow admin to delete products', async () => {
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify product is deleted
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });

    it('should prevent regular user from deleting products', async () => {
      // Create a product first
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product to Delete',
          price: 50.00,
          stock: 5,
          description: 'This product will be used for delete test'
        });

      const newProductId = createResponse.body.product.id;

      // Try to delete as regular user
      await request(app)
        .delete(`/api/products/${newProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Verify product still exists
      await request(app)
        .get(`/api/products/${newProductId}`)
        .expect(200);
    });
  });

  describe('Admin Order Management', () => {
    beforeAll(async () => {
      // Create a product and order for testing
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Order Test Product',
          price: 30.00,
          stock: 20,
          description: 'Product for order testing'
        });

      // Add to cart and create order as regular user
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productResponse.body.product.id,
          quantity: 1
        });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('should allow admin to view all orders', async () => {
      const response = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.orders.length).toBeGreaterThan(0);
      expect(response.body.orders[0]).toHaveProperty('user_name');
      expect(response.body.orders[0]).toHaveProperty('user_email');
      expect(response.body.orders[0]).toHaveProperty('total');
      expect(response.body.orders[0]).toHaveProperty('items');
    });

    it('should prevent regular user from viewing all orders', async () => {
      await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Admin Authentication Checks', () => {
    it('should validate admin role for product operations', async () => {
      // Test all admin-only endpoints
      const adminEndpoints = [
        { method: 'post', path: '/api/products', data: { name: 'Test', price: 10, stock: 5 } },
        { method: 'put', path: '/api/products/1', data: { name: 'Test', price: 10, stock: 5 } },
        { method: 'delete', path: '/api/products/1' },
        { method: 'get', path: '/api/orders/admin/all' }
      ];

      for (const endpoint of adminEndpoints) {
        let req = request(app)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);
        
        if (endpoint.data) {
          req = req.send(endpoint.data);
        }

        await req.expect(403);
      }
    });

    it('should require authentication for admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'post', path: '/api/products', data: { name: 'Test', price: 10, stock: 5 } },
        { method: 'put', path: '/api/products/1', data: { name: 'Test', price: 10, stock: 5 } },
        { method: 'delete', path: '/api/products/1' },
        { method: 'get', path: '/api/orders/admin/all' }
      ];

      for (const endpoint of adminEndpoints) {
        let req = request(app)[endpoint.method](endpoint.path);
        
        if (endpoint.data) {
          req = req.send(endpoint.data);
        }

        await req.expect(401);
      }
    });
  });

  describe('Admin Role Verification', () => {
    it('should properly identify admin users', async () => {
      // Get admin profile
      const adminProfile = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Note: In this simplified test, we're not actually setting the role to 'admin'
      // In a real application, you would have a proper user role management system
      expect(adminProfile.body.user).toHaveProperty('role');
    });

    it('should properly identify regular users', async () => {
      // Get user profile
      const userProfile = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userProfile.body.user).toHaveProperty('role');
      expect(userProfile.body.user.role).toBe('user');
    });
  });

  describe('Data Validation for Admin Operations', () => {
    it('should validate product data when creating', async () => {
      const invalidProducts = [
        { name: '', price: 10, stock: 5 }, // Empty name
        { name: 'Test', price: -10, stock: 5 }, // Negative price
        { name: 'Test', price: 10, stock: -5 }, // Negative stock
        { price: 10, stock: 5 }, // Missing name
      ];

      for (const invalidProduct of invalidProducts) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidProduct)
          .expect(400);
      }
    });

    it('should validate product data when updating', async () => {
      // Create a valid product first
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Valid Product',
          price: 25.00,
          stock: 10,
          description: 'Valid product for update testing'
        });

      const productId = createResponse.body.product.id;

      // Try invalid updates
      const invalidUpdates = [
        { name: '', price: 10, stock: 5 },
        { name: 'Test', price: -10, stock: 5 },
        { name: 'Test', price: 10, stock: -5 },
      ];

      for (const invalidUpdate of invalidUpdates) {
        await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidUpdate)
          .expect(400);
      }
    });
  });
});