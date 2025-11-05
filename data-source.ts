import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Product } from './src/products/entities/product.entity';
import { Category } from './src/categories/entities/category.entity';
import { Order } from './src/orders/entities/order.entity';
import { OrderItem } from './src/orders/entities/order-item.entity';
import { Upload } from './src/upload/upload.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 54321,
  username: 'user',
  password: 'password',
  database: 'ecommerce',
  entities: [User, Product, Category, Order, OrderItem, Upload],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});