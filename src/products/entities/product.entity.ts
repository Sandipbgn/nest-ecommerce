import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  brand: string;

  @Column({ type: 'jsonb' })
  variants: variant[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  OrderItems: OrderItem[];
}

type variant = {
  color: string;
  size: string;
  stock: number;
};
