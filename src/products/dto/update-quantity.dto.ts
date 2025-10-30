import { IsNumber, Min } from 'class-validator';

export class UpdateQuantityDto {
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  quantityAvailable: number;
}