# E-Commerce Platform - Student Project Guidebook

> A simple, learning-focused e-commerce platform built with NestJS

---

## Project Overview

This is a simplified e-commerce platform designed for learning NestJS, TypeORM, PostgreSQL, and backend development concepts. The focus is on building a functional system with core e-commerce features while keeping complexity manageable.

**Tech Stack:**
- NestJS (Backend Framework)
- TypeORM (Database ORM)
- PostgreSQL (Database)
- Cloudinary (File Storage)
- JWT (Authentication)
- PayPal (Payment Integration)

---

## Features List

### ✅ User Management
- User registration and login
- JWT-based authentication
- Role-based access control (User/Admin)

### ✅ Product Management
- Browse products
- Admin: Add, update, delete products
- Product image upload

### 🔄 Shopping Cart (To Do)
- Add/remove items
- Update quantities
- View cart

### 🔄 Order Management (To Do)
- Create orders from cart
- View order history
- Update order status

### 🔄 Payment (To Do)
- Simple PayPal integration
- Transaction history

### 📦 File Upload (Assignment)
- Upload files to Cloudinary
- Store in database
- Delete files

---

## Database Schema

### Enhanced Schema (Pseudo Code)

```typescript
// ==================== USERS ====================
Entity: User {
  id: UUID (Primary Key)
  name: String
  email: String (Unique)
  password: String (Hashed)
  role: Enum(user, admin) - Default: user
  createdAt: DateTime
  
  // Relations
  cartItems: CartItem[]
  orders: Order[]
  payments: Payment[]
}

// ==================== PRODUCTS ====================
Entity: Product {
  id: UUID (Primary Key)
  name: String
  description: String
  price: Float
  stock: Integer - Default: 0
  category: String
  imageUrl: String? (Or imageIds: String[])
  createdAt: DateTime
  
  // Relations
  cartItems: CartItem[]
}

// ==================== CART ====================
Entity: CartItem {
  id: UUID (Primary Key)
  userId: String (Foreign Key -> User.id)
  productId: String (Foreign Key -> Product.id)
  quantity: Integer - Default: 1
  
  // Relations
  user: User
  product: Product
}

// ==================== ORDERS ====================
Entity: Order {
  id: UUID (Primary Key)
  userId: String (Foreign Key -> User.id)
  totalPrice: Float
  status: Enum(pending, paid, shipped, delivered, cancelled)
  createdAt: DateTime
  
  // Relations
  user: User
  payment: Payment
}

// ==================== PAYMENTS ====================
Entity: Payment {
  id: UUID (Primary Key)
  orderId: String (Unique, Foreign Key -> Order.id)
  userId: String (Foreign Key -> User.id)
  amount: Float
  status: Enum(pending, completed, failed)
  transactionId: String? (PayPal transaction ID)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  order: Order
  user: User
}

// ==================== CATEGORIES ====================
Entity: Category {
  id: Integer (Primary Key)
  name: String
  description: String
  isActive: Boolean - Default: true
  createdAt: DateTime
}

// ==================== UPLOADS ====================
Entity: Upload {
  id: UUID (Primary Key)
  publicId: String (Unique - Cloudinary public_id)
  secureUrl: String (Cloudinary URL)
  originalFilename: String?
  bytes: Integer (File size)
  format: String (jpg, png, etc.)
  width: Integer?
  height: Integer?
  createdAt: DateTime
}
```

---

## API Endpoints Reference

### 🔐 Authentication & Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/users/profile` | Get current user profile | User |
| PUT | `/users/profile` | Update user profile | User |

### 📦 Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products | Public |
| GET | `/products/:id` | Get product by ID | Public |
| POST | `/products` | Create new product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### 🛒 Shopping Cart

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/cart` | Get user's cart items | User |
| POST | `/cart` | Add item to cart | User |
| PUT | `/cart/:id` | Update cart item quantity | User |
| DELETE | `/cart/:id` | Remove item from cart | User |
| DELETE | `/cart/clear` | Clear entire cart | User |

### 📋 Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/orders` | Create order from cart | User |
| GET | `/orders` | Get user's order history | User |
| GET | `/orders/:id` | Get order details | User |
| GET | `/orders/all` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |

### 💳 Payments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/payments/create` | Create payment for order | User |
| POST | `/payments/confirm` | Confirm PayPal payment | User |
| GET | `/payments/history` | Get payment history | User |

### 🏷️ Categories

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/categories` | Get all categories | Public |
| GET | `/categories/:id` | Get category by ID | Public |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

### 📁 File Upload

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/upload/image` | Upload single image | User |
| POST | `/upload/images` | Upload multiple images | User |
| DELETE | `/upload/:id` | Delete single upload | User/Admin |
| DELETE | `/upload/multiple` | Delete multiple uploads | User/Admin |

---

## Implementation Status

### ✅ Completed
- [x] Users module (CRUD)
- [x] Authentication (JWT)
- [x] Products module (CRUD)
- [x] Categories module (CRUD)
- [x] File upload (Cloudinary)
- [x] Auth & Role guards

### 🔄 In Progress
- [ ] Orders module (basic structure exists)
- [ ] Upload entity (assignment)

### ❌ To Do
- [ ] Cart module
- [ ] Payments module (PayPal)
- [ ] Order workflow

---


## Development Guidelines

### Code Organization
```
src/
├── auth/           # Authentication logic
├── users/          # User management
├── products/       # Product management
├── categories/     # Category management
├── cart/           # Shopping cart (to be created)
├── orders/         # Order management
├── payments/       # Payment processing (to be created)
└── upload/         # File upload handling
```

### Key Principles
- Keep it simple
- CRUD first, then add features
- Always validate input (DTOs)
- Handle errors properly
- Test your endpoints

---

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [PayPal API](https://developer.paypal.com/api/rest/)

---
## Notes
- Remember: Your code does not have to be an exact match to this guide - this is just for reference, no need to be a copycat.
- APIs and entities do not have to be an exact match but should be similar, so focus on their outcome rather than matching
- Focus on understanding the concepts rather than perfect implementation - learning is the goal
- Test your endpoints frequently with Postman or similar tools
- Use the existing modules as reference for patterns and structure
- Don't worry about advanced features - keep it simple and functional
- Database relations are important - think about how entities connect to each other
- Error handling is crucial - always handle potential failures gracefully
- Security matters - use guards, validate inputs, and hash passwords properly
---

**Keep it simple. Focus on learning. Happy Coding! 🚀**