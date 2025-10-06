import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  parentCategoryId?: number;
}
