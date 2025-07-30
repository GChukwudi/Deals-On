# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Validation Errors (400):**
- Name must be at least 2 characters
- Valid email is required
- Password must be at least 6 characters
- User already exists (duplicate email)

---

### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Get User Profile
**GET** `/auth/profile`

Get current user information. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

---

## Product Endpoints

### Get All Products
**GET** `/products`

Retrieve all products with pagination. Public endpoint.

**Query Parameters:**
- `limit` (optional): Number of products per page (default: 20)
- `offset` (optional): Number of products to skip (default: 0)

**Example Request:**
```
GET /api/products?limit=10&offset=0
```

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Smartphone X1",
      "price": 599.99,
      "stock": 50,
      "description": "Latest smartphone with advanced features",
      "image_url": "https://example.com/phone.jpg",
      "created_at": "2024-07-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 1
  }
}
```

---

### Get Single Product
**GET** `/products/:id`

Get details of a specific product. Public endpoint.

**Path Parameters:**
- `id`: Product ID

**Response (200):**
```json
{
  "product": {
    "id": 1,
    "name": "Smartphone X1",
    "price": 599.99,
    "stock": 50,
    "description": "Latest smartphone with advanced features",
    "image_url": "https://example.com/phone.jpg",
    "created_at": "2024-07-30T10:00:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "error": "Product not found"
}
```

---

### Create Product (Admin Only)
**POST** `/products`

Create a new product. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "price": 99.99,
  "stock": 25,
  "description": "Product description",
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 9,
    "name": "New Product",
    "price": 99.99,
    "stock": 25,
    "description": "Product description",
    "image_url": "https://example.com/image.jpg"
  }
}
```

**Validation Errors (400):**
- Product name is required (min 2 characters)
- Valid price is required (must be > 0)
- Valid stock quantity is required (must be ≥ 0)

**Authorization Errors:**
- `401`: Access token required
- `403`: Admin access required

---

### Update Product (Admin Only)
**PUT** `/products/:id`

Update an existing product. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "name": "Updated Product",
  "price": 149.99,
  "stock": 30,
  "description": "Updated description",
  "image_url": "https://example.com/updated.jpg"
}
```

**Response (200):**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product",
    "price": 149.99,
    "stock": 30,
    "description": "Updated description",
    "image_url": "https://example.com/updated.jpg"
  }
}
```

---

### Delete Product (Admin Only)
**DELETE** `/products/:id`

Delete a product. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Path Parameters:**
- `id`: Product ID

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Error (404):**
```json
{
  "error": "Product not found"
}
```

---

## Shopping Cart Endpoints

### Get User's Cart
**GET** `/cart`

Retrieve current user's cart items. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "name": "Smartphone X1",
      "price": 599.99,
      "quantity": 2,
      "image_url": "https://example.com/phone.jpg"
    }
  ],
  "total": 1199.98,
  "count": 1
}
```

---

### Add Item to Cart
**POST** `/cart/items`

Add a product to the cart. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Item added to cart",
  "item": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2
  }
}
```

**Validation Errors (400):**
- Valid product ID is required
- Quantity must be at least 1
- Insufficient stock

**Error (404):**
```json
{
  "error": "Product not found"
}
```

---

### Update Cart Item Quantity
**PUT** `/cart/items/:id`

Update quantity of a cart item. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Cart item ID

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart item updated",
  "item": {
    "id": 1,
    "quantity": 3
  }
}
```

**Note:** Setting quantity to 0 will remove the item from cart.

---

### Remove Item from Cart
**DELETE** `/cart/items/:id`

Remove a specific item from cart. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Cart item ID

**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

---

### Clear Entire Cart
**DELETE** `/cart`

Remove all items from the user's cart. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Cart cleared",
  "cleared": 3
}
```

---

## Order Endpoints

### Get User's Orders
**GET** `/orders`

Retrieve all orders for the current user. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "total": 1199.98,
      "status": "pending",
      "items": [
        {
          "product_id": 1,
          "name": "Smartphone X1",
          "price": 599.99,
          "quantity": 2
        }
      ],
      "created_at": "2024-07-30T15:30:00.000Z"
    }
  ]
}
```

---

### Create Order
**POST** `/orders`

Create a new order from the current cart items. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** None (uses current cart)

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "user_id": 1,
    "total": 1199.98,
    "status": "pending",
    "items": [
      {
        "product_id": 1,
        "name": "Smartphone X1",
        "price": 599.99,
        "quantity": 2
      }
    ]
  }
}
```

**Process:**
1. Validates cart is not empty
2. Checks stock availability for all items
3. Creates order record
4. Updates product stock quantities
5. Clears the user's cart

**Errors (400):**
- Cart is empty
- Insufficient stock for item: `{item_name}`. Available: `{available}`, Requested: `{requested}`

---

### Get All Orders (Admin Only)
**GET** `/orders/admin/all`

Retrieve all orders from all users. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "total": 1199.98,
      "status": "pending",
      "items": [
        {
          "product_id": 1,
          "name": "Smartphone X1",
          "price": 599.99,
          "quantity": 2
        }
      ],
      "created_at": "2024-07-30T15:30:00.000Z"
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Validation error or invalid data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions (admin required) |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Demo Accounts

### Admin Account
```json
{
  "email": "admin@kenkeputa.com",
  "password": "admin123",
  "role": "admin"
}
```

**Permissions:**
- All user permissions
- Create, update, delete products
- View all orders from all users

### Regular User Account
```json
{
  "email": "user@test.com",
  "password": "user123",
  "role": "user"
}
```

**Permissions:**
- View products
- Manage personal cart
- Create orders
- View personal order history

---

## Example cURL Commands

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "user123"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "New Product",
    "price": 99.99,
    "stock": 25,
    "description": "Product description",
    "image_url": "https://example.com/image.jpg"
  }'
```

---

## Rate Limiting

Currently no rate limiting is implemented, but in production you should consider:
- Login attempts: 5 per minute per IP
- API requests: 100 per minute per user
- Cart operations: 20 per minute per user

---

## Security Notes

1. **JWT Tokens**: Expire after 24 hours
2. **Password Hashing**: Uses bcryptjs with salt rounds of 10
3. **CORS**: Enabled for all origins (configure for production)
4. **SQL Injection**: Prevented using parameterized queries
5. **Input Validation**: Server-side validation for all endpoints

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  items TEXT NOT NULL, -- JSON string of order items
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```