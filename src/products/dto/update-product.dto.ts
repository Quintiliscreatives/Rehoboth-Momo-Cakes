import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MinLength,
  Min,
  IsUrl,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid image URL' })
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  quantityAvailable?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}