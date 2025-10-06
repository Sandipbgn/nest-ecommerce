import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  getAllProducts(): Promise<Product[]> {
    try {
      return this.productRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  getOneProduct(id: string): Promise<Product | null> {
    try {
      return this.productRepository.findOneBy({ id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  addProduct(creatProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(creatProductDto); //This line is responsible for creating and copying the properties from entity
      return this.productRepository.save(product); //this line is responsible for saving the data in DB
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const existingProduct = await this.productRepository.findOneBy({ id });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      const updatedProduct = this.productRepository.merge(
        existingProduct,
        updateProductDto,
      );

      return this.productRepository.save(updatedProduct);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.productRepository.delete(id);
      return;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
