import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(filters?: { isActive?: boolean; search?: string }) {
    console.log('=== CATEGORIES SERVICE ===');
    console.log('Action: Fetching all categories');
    console.log('Filters:', filters);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    try {
      const queryBuilder =
        this.categoryRepository.createQueryBuilder('category');

      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('category.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }

      if (filters?.search) {
        queryBuilder.andWhere('category.name ILIKE :search', {
          search: `%${filters.search}%`,
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: number) {
    console.log('=== CATEGORIES SERVICE ===');
    console.log('Action: Fetching category by ID');
    console.log('Category ID:', id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    try {
      const category = await this.categoryRepository.findOneBy({ id });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    console.log('=== CATEGORIES SERVICE ===');
    console.log('Action: Creating new category');
    console.log('Category Data:', createCategoryDto);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    console.log('=== CATEGORIES SERVICE ===');
    console.log('Action: Updating category');
    console.log('Category ID:', id);
    console.log('Update Data:', updateCategoryDto);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    try {
      const existingCategory = await this.categoryRepository.findOneBy({ id });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = this.categoryRepository.merge(
        existingCategory,
        updateCategoryDto,
      );

      return await this.categoryRepository.save(updatedCategory);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: number) {
    console.log('=== CATEGORIES SERVICE ===');
    console.log('Action: Deleting category');
    console.log('Category ID:', id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    try {
      const category = await this.categoryRepository.findOneBy({ id });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      await this.categoryRepository.remove(category);
      return { message: `Category with ID ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
