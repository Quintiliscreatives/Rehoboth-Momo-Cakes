import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(10, {
    message: 'Phone number must be at least 10 characters long',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(10, { message: 'Address must be at least 10 characters long' })
  address: string;

  @IsNumber({}, { message: 'Age must be a valid number' })
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must not exceed 120' })
  age: number;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  additionalInformation?: string;
}
