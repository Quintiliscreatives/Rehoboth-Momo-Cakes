import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MinLength,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  name: string;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid image URL' })
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  quantityAvailable: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}