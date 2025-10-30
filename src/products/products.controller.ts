import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Public endpoints (for frontend customers)
  @Get()
  async findAllActive() {
    return {
      message: 'Active products retrieved successfully',
      data: await this.productsService.findAllActive(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      message: 'Product retrieved successfully',
      data: await this.productsService.findOne(id),
    };
  }

  // Admin-only endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createProductDto: CreateProductDto) {
    return {
      message: 'Product created successfully',
      data: await this.productsService.create(createProductDto),
    };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return {
      message: 'All products retrieved successfully',
      data: await this.productsService.findAll(true), // Include inactive products
    };
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return {
      message: 'Product statistics retrieved successfully',
      data: await this.productsService.getProductsStats(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return {
      message: 'Product updated successfully',
      data: await this.productsService.update(id, updateProductDto),
    };
  }

  @Put(':id/quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateQuantity(
    @Param('id') id: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    return {
      message: 'Product quantity updated successfully',
      data: await this.productsService.updateQuantity(id, updateQuantityDto),
    };
  }

  @Patch(':id/increment-quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async incrementQuantity(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return {
      message: 'Product quantity incremented successfully',
      data: await this.productsService.incrementQuantity(id, body.quantity),
    };
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return {
      message: 'Product status toggled successfully',
      data: await this.productsService.toggleActive(id),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return {
      message: 'Product deleted successfully',
    };
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide an image file');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must be less than 5MB');
    }

    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      const updatedProduct = await this.productsService.update(id, {
        image: uploadResult.url,
      });

      return {
        message: 'Product image uploaded successfully',
        data: {
          product: updatedProduct,
          imageUrl: uploadResult.url,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }
}