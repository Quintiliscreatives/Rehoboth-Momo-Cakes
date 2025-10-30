import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    // Check if user already exists by email
    const existingUserByEmail = await this.userModel
      .findOne({ email: dto.email })
      .exec();
    if (existingUserByEmail) {
      throw new Error('A user with this email already exists');
    }

    // Check if user already exists by phone number
    const existingUserByPhone = await this.userModel
      .findOne({ phoneNumber: dto.phoneNumber })
      .exec();
    if (existingUserByPhone) {
      throw new Error('A user with this phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel
      .find({ role })
      .select('-password -refreshToken')
      .exec();
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password -refreshToken').exec();
  }
}
