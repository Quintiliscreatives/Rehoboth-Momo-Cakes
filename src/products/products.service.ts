import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Check if product with same name already exists
      const existingProduct = await this.productModel.findOne({
        name: { $regex: new RegExp(`^${createProductDto.name}$`, 'i') },
      });

      if (existingProduct) {
        throw new ConflictException('A product with this name already exists');
      }

      const createdProduct = new this.productModel(createProductDto);
      return await createdProduct.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Product[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return await this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllActive(): Promise<Product[]> {
    return await this.productModel
      .find({ isActive: true, quantityAvailable: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      // If updating name, check for conflicts
      if (updateProductDto.name) {
        const existingProduct = await this.productModel.findOne({
          name: { $regex: new RegExp(`^${updateProductDto.name}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingProduct) {
          throw new ConflictException('A product with this name already exists');
        }
      }

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }

      return updatedProduct;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async updateQuantity(id: string, updateQuantityDto: UpdateQuantityDto): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { quantityAvailable: updateQuantityDto.quantityAvailable },
        { new: true }
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async decrementQuantity(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.quantityAvailable < quantity) {
      throw new BadRequestException('Insufficient product quantity available');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { quantityAvailable: -quantity } },
        { new: true }
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async incrementQuantity(id: string, quantity: number): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { quantityAvailable: quantity } },
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async toggleActive(id: string): Promise<Product> {
    const product = await this.findOne(id);
    
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { isActive: !product.isActive },
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async getProductsStats() {
    const totalProducts = await this.productModel.countDocuments();
    const activeProducts = await this.productModel.countDocuments({ isActive: true });
    const outOfStockProducts = await this.productModel.countDocuments({ quantityAvailable: 0 });
    const lowStockProducts = await this.productModel.countDocuments({ 
      quantityAvailable: { $gt: 0, $lte: 5 } 
    });

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
    };
  }
}