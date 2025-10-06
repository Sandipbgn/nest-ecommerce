import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    private dataSource: DataSource,
  ) {}

  async findAll(filters?: {
    status?: OrderStatus;
    userId?: number;
    page?: number;
    limit?: number;
  }) {
    console.log('=== ORDERS SERVICE ===');
    console.log('Action: Fetching all orders');
    console.log('Filters:', filters);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order');

      if (filters?.status) {
        queryBuilder.andWhere('order.status = :status', {
          status: filters.status,
        });
      }

      if (filters?.userId) {
        queryBuilder.andWhere('order.userId = :userId', {
          userId: filters.userId,
        });
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    console.log('=== ORDERS SERVICE ===');
    console.log('Action: Fetching order by ID');
    console.log('Order ID:', id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    try {
      const order = await this.orderRepository.findOneBy({ id });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order | null> {
    // Calculate total amount
    const totalAmount = createOrderDto.orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    try {
      const { orderItems, ...orderData } = createOrderDto;
      //using transaction to ensure both order and order items are created
      const createdOrder = await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          const order = this.orderRepository.create({
            ...orderData,
            totalAmount,
          });

          const createdOrder = await transactionalEntityManager.save(order);
          console.log('Created Order:', createdOrder);

          //create order items from createOrderDto.orderItems
          const orderItem = orderItems.map((item) =>
            this.orderItemRepository.create({
              ...item,
              product: { id: item.productId },
              order: createdOrder,
            }),
          );

          await transactionalEntityManager.save(orderItem);

          const fullOrder = await transactionalEntityManager.findOne(Order, {
            where: { id: createdOrder.id },
            relations: ['orderItems'],
          });

          return fullOrder;
        },
      );

      return createdOrder;

      // const order = this.orderRepository.create({
      //   ...createOrderDto,
      //   totalAmount,
      // });

      // const createdOrder = await this.orderRepository.save(order);

      // //create order items from createOrderDto.orderItems

      // await this.orderItemRepository.save(
      //   createOrderDto.orderItems.map((item) => ({
      //     ...item,
      //     order: createdOrder,
      //   })),
      // );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    console.log('=== ORDERS SERVICE ===');
    console.log('Action: Updating order');
    console.log('Order ID:', id);
    console.log('Update Data:', updateOrderDto);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    try {
      const existingOrder = await this.orderRepository.findOneBy({ id });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      // Recalculate total if orderItems are updated
      if (updateOrderDto.orderItems) {
        const totalAmount = updateOrderDto.orderItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        const updatedOrder = this.orderRepository.merge(existingOrder, {
          ...updateOrderDto,
          totalAmount,
        });
        return await this.orderRepository.save(updatedOrder);
      }

      const updatedOrder = this.orderRepository.merge(
        existingOrder,
        updateOrderDto,
      );
      return await this.orderRepository.save(updatedOrder);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async updateStatus(id: string, status: OrderStatus) {
    console.log('=== ORDERS SERVICE ===');
    console.log('Action: Updating order status');
    console.log('Order ID:', id);
    console.log('New Status:', status);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    try {
      const existingOrder = await this.orderRepository.findOneBy({ id });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      const updatedOrder = this.orderRepository.merge(existingOrder, {
        status,
      });
      return await this.orderRepository.save(updatedOrder);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    console.log('=== ORDERS SERVICE ===');
    console.log('Action: Cancelling/Deleting order');
    console.log('Order ID:', id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    try {
      const order = await this.orderRepository.findOneBy({ id });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      await this.orderRepository.remove(order);
      return { message: `Order with ID ${id} cancelled successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
