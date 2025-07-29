const request = require('supertest');
const { app } = require('../server');

describe('Cart Endpoints', () => {
  let userToken;
  let productId;

  beforeAll(async () => {
    // Create user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cart User',
        email: 'cart@test.com',
        password: 'cart123'
      });
    userToken = userResponse.body.token;

    // Create a product to add to cart
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cart Admin',
        email: 'cartadmin@test.com',
        password: 'admin123'
      });

    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminResponse.body.token}`)
      .send({
        name: 'Cart Test Product',
        price: 50.00,
        stock: 100,
        description: 'Product for cart testing'
      });
    
    productId = productResponse.body.product.id;
  });

  describe('GET /api/cart', () => {
    it('should get empty cart initially', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.count).toBe(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        })
        .expect(201);

      expect(response.body).toHaveProperty('item');
    });

    it('should validate product exists', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: 99999,
          quantity: 1
        })
        .expect(404);
    });

    it('should validate quantity', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 0
        })
        .expect(400);
    });

    it('should check stock availability', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 200 // More than available stock
        })
        .expect(400);
    });
  });

  describe('GET /api/cart (with items)', () => {
    it('should get cart with items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/cart/items/:id', () => {
    let cartItemId;

    beforeAll(async () => {
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      cartItemId = cartResponse.body.items[0].id;
    });

    it('should update cart item quantity', async () => {
      await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 })
        .expect(200);
    });

    it('should remove item when quantity is 0', async () => {
      await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 })
        .expect(200);
    });
  });

  describe('DELETE /api/cart/items/:id', () => {
    let cartItemId;

    beforeAll(async () => {
      // Add item back
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });

      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      cartItemId = cartResponse.body.items[0].id;
    });

    it('should remove item from cart', async () => {
      await request(app)
        .delete(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('DELETE /api/cart', () => {
    beforeAll(async () => {
      // Add some items
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        });
    });

    it('should clear entire cart', async () => {
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify cart is empty
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(cartResponse.body.items).toEqual([]);
      expect(cartResponse.body.total).toBe(0);
    });
  });
});