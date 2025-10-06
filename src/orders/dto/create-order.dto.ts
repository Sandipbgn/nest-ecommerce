import {
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  MinLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  shippingAddress: string;

  @IsString()
  @IsIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
}
