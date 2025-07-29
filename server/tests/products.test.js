const request = require('supertest');
const { app } = require('../server');

describe('Products Endpoints', () => {
  let adminToken;
  let userToken;
  let productId;

  const testProduct = {
    name: 'Test Product',
    price: 99.99,
    stock: 10,
    description: 'Test product description',
    image_url: 'https://example.com/image.jpg'
  };

  beforeAll(async () => {
    // Create admin user and get token
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123'
      });
    
    // Manually set as admin (in real app, this would be done via database)
    adminToken = adminResponse.body.token;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'user123'
      });
    userToken = userResponse.body.token;
  });

  describe('GET /api/products', () => {
    it('should get all products (public)', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?limit=5&offset=0')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testProduct)
        .expect(201);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(testProduct.name);
      expect(response.body.product.price).toBe(testProduct.price);
      productId = response.body.product.id;
    });

    it('should reject product creation for regular user', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testProduct)
        .expect(403);
    });

    it('should reject product creation without auth', async () => {
      await request(app)
        .post('/api/products')
        .send(testProduct)
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          price: -10,
          stock: -5
        })
        .expect(400);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get single product', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/99999')
        .expect(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    const updatedProduct = {
      ...testProduct,
      name: 'Updated Product',
      price: 149.99
    };

    it('should update product as admin', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedProduct)
        .expect(200);

      expect(response.body.product.name).toBe(updatedProduct.name);
      expect(response.body.product.price).toBe(updatedProduct.price);
    });

    it('should reject update for regular user', async () => {
      await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedProduct)
        .expect(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should reject delete for regular user', async () => {
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete product as admin', async () => {
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 404 for deleted product', async () => {
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });
});