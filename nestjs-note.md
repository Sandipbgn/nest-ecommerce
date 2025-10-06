# NestJS Complete Revision Guide

> Comprehensive NestJS reference covering fundamentals, architecture, and practical implementation.

---

## Table of Contents
1. [Introduction to NestJS](#1-introduction-to-nestjs)
2. [NestJS CLI](#2-nestjs-cli)
3. [Project Structure](#3-project-structure)
4. [Modules](#4-modules)
5. [Controllers](#5-controllers)
6. [Providers & Services](#6-providers--services)
7. [Dependency Injection](#7-dependency-injection)
8. [DTOs (Data Transfer Objects)](#8-dtos-data-transfer-objects)
9. [Validation](#9-validation)
10. [TypeORM Integration](#10-typeorm-integration)
11. [Entities & Database Models](#11-entities--database-models)
12. [Repository Pattern](#12-repository-pattern)
13. [Database Relationships](#13-database-relationships)
14. [Exception Handling](#14-exception-handling)
15. [Pipes](#15-pipes)
16. [Query Parameters & Filtering](#16-query-parameters--filtering)
17. [Database Transactions](#17-database-transactions)
18. [Swagger Documentation](#18-swagger-documentation)
19. [Module Communication & Best Practices](#19-module-communication--best-practices)

---

## 1. Introduction to NestJS

**NestJS** is a progressive Node.js framework for building scalable server-side applications using TypeScript. It combines OOP, FP, and FRP patterns with a complete architecture out of the box.

**Core Benefits:**
- **Modular Architecture** - Organized, scalable code structure
- **TypeScript First** - Type safety and better development experience
- **Dependency Injection** - Automatic dependency management
- **Enterprise Ready** - Built with SOLID principles

**Architecture:**
```
Modules → Feature organization
Controllers → HTTP request handling  
Services → Business logic
Providers → Injectable dependencies
```

---

## 2. NestJS CLI

### Installation & Setup
```bash
npm install -g @nestjs/cli
nest new my-app
cd my-app
npm run start:dev
```

### Key Generators
```bash
# Complete feature with CRUD
nest g resource products

# Individual components
nest g module users
nest g controller users  
nest g service users
nest g class dto/create-user --no-spec

# Utilities
nest g guard auth
nest g pipe validation
nest g interceptor transform
```

### Common Flags
- `--no-spec` - Skip test files
- `--dry-run` - Preview changes
- `--flat` - No folder creation

### Scripts
```bash
npm run start:dev        # Development
npm run build           # Production build
npm run test            # Unit tests
npm run test:e2e        # E2E tests
```

---

## 3. Project Structure

### Recommended Structure
```
src/
├── main.ts              # Entry point
├── app.module.ts        # Root module
├── users/               # Feature modules
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── products/
└── common/              # Shared utilities
    ├── guards/
    ├── pipes/
    └── interceptors/
```

### Key Files

**main.ts** - Bootstrap application
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
```

**app.module.ts** - Root module
```typescript
@Module({
  imports: [UsersModule, ProductsModule],
})
export class AppModule {}
```

---

## 4. Modules

**Modules** organize related functionality into cohesive units. Each feature should have its own module.

### @Module Decorator
```typescript
@Module({
  imports: [],       // Other modules needed
  controllers: [],   // Route handlers
  providers: [],     // Services/logic
  exports: []        // Share with other modules
})
export class FeatureModule {}
```

### Complete Example
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Available to other modules
})
export class UsersModule {}
```

### Module Communication
```typescript
// orders.module.ts
@Module({
  imports: [UsersModule, ProductsModule],  // Import other modules
  providers: [OrdersService],
})
export class OrdersModule {}

// orders.service.ts - Inject services from imported modules
@Injectable()
export class OrdersService {
  constructor(
    private usersService: UsersService,
    private productsService: ProductsService
  ) {}
}
```

### Global Modules
```typescript
@Global()  // Available everywhere without importing
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

---

## 5. Controllers

**Controllers** handle HTTP requests and return responses. They define routes and delegate business logic to services.

### Basic Controller
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

@Controller('users')  // Base route: /users
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()              // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')         // GET /users/123
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()             // POST /users
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')         // PUT /users/123
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')      // DELETE /users/123
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

### Route Parameters

**Path Parameters:**
```typescript
@Get(':id')
findOne(@Param('id') id: string) {}  // GET /users/123

@Get(':userId/posts/:postId')
findUserPost(
  @Param('userId') userId: string,
  @Param('postId') postId: string
) {}  // GET /users/5/posts/42
```

**Query Parameters:**
```typescript
@Get()
findAll(
  @Query('category') category: string,
  @Query('price') price: number
) {}  // GET /products?category=electronics&price=100
```

**Request Body:**
```typescript
@Post()
create(@Body() dto: CreateUserDto) {}
// POST /users with JSON body
```

**Headers:**
```typescript
@Get()
findAll(@Headers('authorization') token: string) {}
```

### Async Operations
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return await this.usersService.create(dto);
  }
}
```

### Response Customization
```typescript
@Post()
@HttpCode(201)  // Custom status code
@Header('Cache-Control', 'none')  // Custom header
create() {
  return 'Created';
}
```

### Best Practices
- **Keep controllers thin** - delegate to services
- **Use DTOs** for type safety
- **Use async/await** for database operations
- **Don't put business logic** in controllers

---

## 6. Providers & Services

**Providers** are injectable classes containing business logic, database operations, and external API calls. **Services** are the most common type of provider.

**Separation of Concerns:**
- Controllers handle HTTP requests (thin layer)
- Services contain business logic (reusable)
- Easy to test independently

### Creating a Service
```bash
nest g service users
```

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()  // Makes class injectable
export class UsersService {
  findAll() {
    return 'This returns all users';
  }

  findOne(id: number) {
    return `This returns user #${id}`;
  }

  create(createUserDto: CreateUserDto) {
    return 'This creates a user';
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This updates user #${id}`;
  }

  remove(id: number) {
    return `This removes user #${id}`;
  }
}
```

### Injecting Service into Controller
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Service with Database Operations
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
```

### Service Composition
```typescript
@Injectable()
export class OrdersService {
  constructor(
    private usersService: UsersService,
    private productsService: ProductsService
  ) {}

  async createOrder(userId: number, productId: number) {
    const user = await this.usersService.findOne(userId);
    const product = await this.productsService.findOne(productId);
    
    return {
      user: user.name,
      product: product.name,
      total: product.price
    };
  }
}
```

### Best Practices
- **Single Responsibility** - One service, one purpose
- **Descriptive Names** - Clear, specific naming
- **Use DTOs** for type safety
- **Focus Methods** - Each method does one thing

---

## 7. Dependency Injection

**Dependency Injection (DI)** is a design pattern where classes receive dependencies from external sources rather than creating them internally.

### Benefits of DI
- **Loose Coupling** - Easy to change implementations
- **Testability** - Mock dependencies for testing
- **Reusability** - Share instances across classes
- **Maintainability** - Isolated changes

### How NestJS DI Works

**1. Mark class as injectable:**
```typescript
@Injectable()
export class UsersService {
  findAll() { return []; }
}
```

**2. Register in module:**
```typescript
@Module({
  providers: [UsersService],
})
export class UsersModule {}
```

**3. Inject where needed:**
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
}
```

NestJS automatically creates and provides instances (singleton by default).

### Constructor Injection
```typescript
@Injectable()
export class OrdersService {
  constructor(
    private usersService: UsersService,
    private productsService: ProductsService,
    private emailService: EmailService
  ) {}
}
```

### Repository Injection
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
}
```

### DataSource Injection (for transactions)
```typescript
@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}
  
  async createOrderWithItems(orderData) {
    return await this.dataSource.manager.transaction(async (manager) => {
      // Transaction logic
    });
  }
}
```

### Circular Dependencies
Use `forwardRef()` when services depend on each other:
```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService
  ) {}
}
```

### Custom Providers
```typescript
// Value Provider
@Module({
  providers: [
    { provide: 'API_KEY', useValue: 'secret-key' }
  ]
})

// Factory Provider
@Module({
  providers: [
    {
      provide: 'DB_CONNECTION',
      useFactory: () => createDatabaseConnection()
    }
  ]
})
```

---

## 8. DTOs (Data Transfer Objects)

**DTOs** define the structure of data sent to/from your API, providing type safety, validation, and clear API contracts.

### Why Use DTOs?
- **Type Safety** - Catch errors at compile time
- **Validation** - Ensure correct data before processing
- **Documentation** - Clear API contracts
- **Reusability** - Use across multiple endpoints

### Creating DTOs
```bash
nest g class users/dto/create-user.dto --no-spec
```

```typescript
// Basic DTO
export class CreateUserDto {
  name: string;
  email: string;
  age: number;
}

// Controller usage
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.service.create(createUserDto);
}
```

### DTO with Validation
```typescript
import { IsString, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;
}
```

### Update DTOs using PartialType
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

`PartialType` makes all fields optional - perfect for updates where you might only change some fields.

### Nested DTOs
```typescript
export class AddressDto {
  @IsString()
  street: string;
  @IsString()
  city: string;
  @IsString()
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

### Array DTOs
```typescript
export class OrderItemDto {
  @IsString()
  productId: string;
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Common Patterns
```typescript
// Create DTO - Required fields
export class CreateProductDto {
  @IsString()
  name: string;
  @IsNumber()
  price: number;
}

// Update DTO - Optional fields
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// Query DTO - Search parameters
export class FindProductsDto {
  @IsOptional()
  @IsString()
  category?: string;
  
  @IsOptional()
  @IsNumber()
  minPrice?: number;
}
```

### DTO vs Entity
- **DTOs** define API interface
- **Entities** define database structure
- Map between them in services

---

## 9. Validation

**Validation** ensures data from clients meets requirements before processing, providing security, data integrity, and better user experience.

### Setup
```bash
npm install class-validator class-transformer
```

```typescript
// main.ts - Enable global validation
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
```

### Common Validation Decorators

**String Validation:**
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^[a-zA-Z0-9-_]+$/)
  username: string;
}
```

**Number Validation:**
```typescript
export class CreateProductDto {
  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  @Max(1000)
  stock: number;
}
```

**Other Types:**
```typescript
export class CreatePostDto {
  @IsBoolean()
  published: boolean;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(UserRole)
  role: UserRole;

  @IsDate()
  @Type(() => Date)
  publishDate: Date;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### ValidationPipe Options
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: true,   // Throw error on extra properties
  transform: true,              // Auto-transform types
}));
```

### Custom Messages
```typescript
export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}
```

### Common Patterns
```typescript
// Login
export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}

// Pagination
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
```

---

## 10. TypeORM Integration

**TypeORM** is an ORM (Object-Relational Mapping) library that enables working with databases using TypeScript classes instead of raw SQL.

### Benefits
- **Type Safety** - TypeScript error catching
- **Productivity** - Less code, more features  
- **Database Agnostic** - Works with PostgreSQL, MySQL, SQLite
- **Relationships** - Easy table relations
- **Migrations** - Database schema version control

### Installation
```bash
npm install @nestjs/typeorm typeorm pg  # PostgreSQL
# npm install mysql2                    # MySQL
# npm install sqlite3                   # SQLite
```

### Database Configuration
```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // DEV ONLY!
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class AppModule {}
```

**⚠️ Important:** Never use `synchronize: true` in production - it can drop columns and lose data!

### Registering Entities
```typescript
// users/users.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// Multiple entities
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

---

## 11. Entities & Database Models

**Entities** are TypeScript classes representing database tables. Each class = one table, each instance = one row.

### Creating an Entity
```bash
nest g class users/entities/user.entity --no-spec
```

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // Table name
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

### Key Decorators

```typescript
@Entity('users')              // Table name
export class User {
  @PrimaryGeneratedColumn()   // Auto-increment ID
  id: number;

  @PrimaryGeneratedColumn('uuid')  // UUID ID
  uuid: string;

  @Column()                   // Basic column
  name: string;

  @Column({ unique: true })   // Unique constraint
  email: string;

  @Column({ nullable: true, length: 100 })  // Optional with length
  bio: string;

  @Column({ default: true })  // Default value
  isActive: boolean;

  @CreateDateColumn()         // Auto-set on create
  createdAt: Date;

  @UpdateDateColumn()         // Auto-update on modify
  updatedAt: Date;
}
```

### Column Types
```typescript
// Text
@Column('varchar', { length: 255 })
title: string;
@Column('text')
description: string;

// Numbers
@Column('int')
age: number;
@Column('decimal', { precision: 10, scale: 2 })
price: number;
@Column('float')
rating: number;

// Other types
@Column('boolean')
isActive: boolean;
@Column('date')
birthDate: Date;
@Column('json')
metadata: any;
@Column('simple-array')
tags: string[];

// Enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}
@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
role: UserRole;
```

### Complete Example
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  stock: number;

  @Column('jsonb')
  variants: any[];

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 12. Repository Pattern

**Repository** provides an abstraction layer for database operations, containing methods to interact with entities.

### Accessing Repository
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
}
```

### Common Repository Methods

**Finding Records:**
```typescript
// Basic operations
async findAll(): Promise<User[]> {
  return await this.userRepository.find();
}

async findOne(id: number): Promise<User> {
  return await this.userRepository.findOne({ where: { id } });
}

// With conditions and relations
async findActiveUsers(): Promise<User[]> {
  return await this.userRepository.find({
    where: { isActive: true },
    relations: ['orders'],
    order: { createdAt: 'DESC' },
    skip: 0,
    take: 10
  });
}
```

**Creating/Updating Records:**
```typescript
async create(dto: CreateUserDto): Promise<User> {
  const user = this.userRepository.create(dto);
  return await this.userRepository.save(user);
}

async update(id: number, dto: UpdateUserDto): Promise<User> {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new NotFoundException('User not found');
  
  Object.assign(user, dto);
  return await this.userRepository.save(user);
}

async remove(id: number): Promise<void> {
  const result = await this.userRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException('User not found');
  }
}
```

---

## 13. Database Relationships

**Relationships** define connections between database tables:
- **One-to-One** - User ↔ Profile
- **One-to-Many** - User → Posts
- **Many-to-Many** - Students ↔ Courses

### One-to-Many / Many-to-One
```typescript
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}

// post.entity.ts
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  userId: number; // Foreign key

  @ManyToOne(() => User, (user) => user.posts)
  user: User;
}
```

### One-to-One
```typescript
// user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn() // Owns the relationship
  profile: Profile;
}

// profile.entity.ts
@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
```

### Many-to-Many
```typescript
// student.entity.ts
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable() // Creates join table
  courses: Course[];
}

// course.entity.ts
@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Student, (student) => student.courses)
  students: Student[];
}
```

### Loading Relations
```typescript
// Load with relations
async findUserWithPosts(userId: number): Promise<User> {
  return await this.userRepository.findOne({
    where: { id: userId },
    relations: ['posts', 'profile']
  });
}

// Using query builder
async findUserWithPosts(userId: number): Promise<User> {
  return await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'posts')
    .where('user.id = :id', { id: userId })
    .getOne();
}
```

### E-Commerce Example
```typescript
// Order with OrderItems (join entity pattern)
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column('decimal')
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  orderItems: OrderItem[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;
}
```

### Cascade & Loading Options
```typescript
@OneToMany(() => Post, (post) => post.user, {
  cascade: true,    // Auto-save/remove related entities
  eager: true       // Always load with parent
})
posts: Post[];

// Lazy loading
@OneToMany(() => Post, (post) => post.user)
posts: Promise<Post[]>; // Load on access: await user.posts
```

---

## 14. Exception Handling

**Exceptions** provide proper HTTP error responses instead of generic errors.

### Built-in HTTP Exceptions
```typescript
import {
  BadRequestException,     // 400
  UnauthorizedException,   // 401
  ForbiddenException,      // 403
  NotFoundException,       // 404
  ConflictException,       // 409
  InternalServerErrorException // 500
} from '@nestjs/common';

// Usage examples
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid input data');
```

### Using Exceptions in Services
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userRepository.findOneBy({ email: dto.email });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }
}
```

### Custom Exceptions
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productId: string, requested: number, available: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Insufficient Stock',
        message: `Cannot order ${requested} units of product ${productId}. Only ${available} available.`,
        productId,
        requested,
        available
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
```

### Exception Filters
Custom exception handling:

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      error: exception.getResponse()
    });
  }
}

// Apply globally in main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 15. Pipes

**Pipes** transform or validate data before it reaches route handlers.

### Built-in Pipes
```typescript
// Transform string to number
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}

// Other built-in pipes
@Get()
findAll(
  @Query('active', ParseBoolPipe) active: boolean,
  @Query('price', ParseFloatPipe) price: number,
  @Query('id', ParseUUIDPipe) id: string,
  @Query('ids', ParseArrayPipe) ids: string[],
  @Query('role', new ParseEnumPipe(UserRole)) role: UserRole
) {}
```

### ValidationPipe
Automatically validates DTOs using class-validator decorators:

```typescript
// Global setup in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Remove unknown properties
  forbidNonWhitelisted: true,   // Throw error on unknown properties
  transform: true,              // Transform to DTO instance
}));

// Usage
@Post()
create(@Body() dto: CreateUserDto) {
  // Automatically validated against CreateUserDto decorators
  return this.usersService.create(dto);
}
```

### DefaultValuePipe
```typescript
@Get()
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
) {
  // /users → page=1, limit=10
  // /users?page=2 → page=2, limit=10
}
```

### Custom Pipes
```typescript
@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: string) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new BadRequestException('Invalid JSON');
    }
  }
}

@Injectable()
export class PositiveNumberPipe implements PipeTransform {
  transform(value: any) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException('Must be a positive number');
    }
    return num;
  }
}

// Usage
@Get()
search(@Query('filter', ParseJsonPipe) filter: any) {}

@Get(':id')
findOne(@Param('id', PositiveNumberPipe) id: number) {}
```

### Pipe Scopes
- **Parameter:** `@Param('id', ParseIntPipe)`
- **Method:** `@UsePipes(ValidationPipe)`
- **Controller:** `@Controller() @UsePipes(ValidationPipe)`
- **Global:** `app.useGlobalPipes(new ValidationPipe())`

---

## 16. Query Parameters & Filtering

### @Query() Decorator
```typescript
// Single parameter
@Get()
findAll(@Query('search') search: string) {
  // /users?search=john
}

// Multiple parameters
@Get()
findAll(
  @Query('page') page: string,
  @Query('limit') limit: string,
  @Query('sort') sort: string
) {
  // /users?page=1&limit=10&sort=name
}

// All parameters
@Get()
findAll(@Query() query: any) {
  // /users?name=john&age=25
  // query = { name: 'john', age: '25' }
}
```

### Common Patterns

**Pagination:**
```typescript
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
) {
  const skip = (page - 1) * limit;
  const [data, total] = await this.userRepository.findAndCount({
    skip,
    take: limit
  });
  
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}
```

**Sorting & Filtering:**
```typescript
@Get()
async findAll(
  @Query('sortBy') sortBy: string = 'createdAt',
  @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  @Query('role') role?: string,
  @Query('isActive') isActive?: boolean
) {
  const where: any = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  
  return await this.userRepository.find({
    where,
    order: { [sortBy]: order }
  });
}
```

**Search:**
```typescript
@Get('search')
async search(@Query('q') searchTerm: string) {
  return await this.userRepository
    .createQueryBuilder('user')
    .where('user.name LIKE :term', { term: `%${searchTerm}%` })
    .orWhere('user.email LIKE :term', { term: `%${searchTerm}%` })
    .getMany();
}
```

### Query DTOs
```typescript
export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

// Usage
@Get()
async findAll(@Query() query: QueryUserDto) {
  const { page, limit, sortBy, order, search, role } = query;
  // Build and execute query...
}
```

---

## 17. Database Transactions

**Transactions** ensure a group of database operations ALL succeed or ALL fail together.

### Using DataSource Transaction
```typescript
@Injectable()
export class OrdersService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createOrder(userId: number, items: OrderItemDto[]) {
    return await this.dataSource.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, { userId, totalAmount: 0 });
      await manager.save(order);

      let totalAmount = 0;

      // Process each item
      for (const item of items) {
        const product = await manager.findOneBy(Product, { id: item.productId });
        
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        // Deduct stock
        await manager.update(Product, product.id, {
          stock: product.stock - item.quantity
        });

        // Create order item
        const orderItem = manager.create(OrderItem, {
          order, product, quantity: item.quantity, price: product.price
        });
        await manager.save(orderItem);

        totalAmount += product.price * item.quantity;
      }

      // Update order total
      order.totalAmount = totalAmount;
      await manager.save(order);

      return order;
    });
  }
}
```

### Query Runner (Alternative Method)
```typescript
async createOrder(userId: number, items: OrderItemDto[]) {
  const queryRunner = this.dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const order = queryRunner.manager.create(Order, { userId });
    await queryRunner.manager.save(order);
    
    // ... more operations
    
    await queryRunner.commitTransaction();
    return order;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### When to Use Transactions
✅ **Use for:** Multiple related operations, financial operations, inventory updates
❌ **Don't need for:** Single operations, read-only operations, independent operations

---

## 18. Swagger / API Documentation

**Swagger (OpenAPI)** automatically generates interactive API documentation.

### Setup
```bash
npm install --save @nestjs/swagger
```

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Available at /api

  await app.listen(3000);
}
```

### Decorating DTOs
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User age', minimum: 18, example: 25 })
  @IsInt()
  @Min(18)
  age: number;
}
```

### Decorating Controllers
```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

### CLI Plugin (Auto-generate)

**Automatically adds Swagger decorators!**

```json
// nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

**With plugin, this:**
```typescript
export class CreateUserDto {
  name: string;
  email: string;
  age: number;
}
```

**Automatically becomes:**
```typescript
export class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  age: number;
}
```

**Plugin configuration:**
```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

---

## 19. Module Communication & Best Practices

### Module Communication
Modules share functionality by exporting/importing services.

**Basic Pattern:**
```typescript
// 1. Export from provider module
@Module({
  providers: [ProductsService],
  exports: [ProductsService] // Export service
})
export class ProductsModule {}

// 2. Import module where needed
@Module({
  imports: [ProductsModule], // Import module
  providers: [OrdersService]
})
export class OrdersModule {}

// 3. Inject service
@Injectable()
export class OrdersService {
  constructor(private productsService: ProductsService) {} // Inject
}
```

### Cross-Module Service Usage
```typescript
// orders.service.ts
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private productsService: ProductsService // From ProductsModule
  ) {}

  async createOrder(userId: number, orderDto: CreateOrderDto) {
    const product = await this.productsService.findOne(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new BadRequestException('Product unavailable');
    }
    // Create order logic...
  }
}
```

### Circular Dependencies
Use `forwardRef()` when modules need each other:

```typescript
@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService
  ) {}
}
```

### Global Modules
Make services available everywhere without importing:

```typescript
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService]
})
export class NotificationsModule {}

// Available in any service without importing
@Injectable()
export class UsersService {
  constructor(private emailService: EmailService) {}
}
```

### Project Structure
```
src/
├── app.module.ts
├── main.ts
├── common/            # Shared utilities
│   ├── filters/
│   ├── guards/
│   └── pipes/
├── users/             # Feature modules
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   └── entities/
└── products/
    ├── products.module.ts
    ├── products.controller.ts
    ├── products.service.ts
    ├── dto/
    └── entities/
```

### Best Practices

**Modules:** One per feature, export only needed services  
**Services:** Export from module, import modules (not services)  
**DI:** Constructor injection, avoid circular dependencies  
**DTOs:** Separate create/update, use validation decorators  
**Errors:** Built-in HTTP exceptions, global exception filters  
**Database:** Use transactions, define relationships properly  
**Validation:** Global ValidationPipe, validate all inputs  
**Documentation:** Swagger decorators, document endpoints

---

## Conclusion

**You've learned:**

✅ NestJS fundamentals (modules, controllers, services)  
✅ Dependency Injection pattern  
✅ TypeORM for database operations  
✅ DTOs and validation  
✅ Exception handling  
✅ Pipes for transformation/validation  
✅ Query parameters and filtering  
✅ Database transactions  
✅ Swagger documentation  
✅ Module communication & best practices


**Keep practicing and building! 🚀**