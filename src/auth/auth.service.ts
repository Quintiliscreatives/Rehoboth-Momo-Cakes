import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.usersService.createUser(dto);
      const tokens = await this.generateTokens(
        (user as any)._id.toString(),
        user.email,
        user.role,
      );
      return {
        ...tokens,
        user: {
          _id: (user as any)._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          age: user.age,
          role: user.role,
          additionalInformation: user.additionalInformation,
        },
      };
    } catch (error) {
      if (error.message.includes('email already exists')) {
        throw new ConflictException('A user with this email already exists');
      }
      if (error.message.includes('phone number already exists')) {
        throw new ConflictException(
          'A user with this phone number already exists',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    return {
      ...tokens,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        age: user.age,
        role: user.role,
        additionalInformation: user.additionalInformation,
      },
    };
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    await this.usersService.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = user.refreshToken === refreshToken;
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    return this.generateTokens(user._id.toString(), user.email, user.role);
  }

  async getAllDistributors() {
    return this.usersService.findByRole(UserRole.DISTRIBUTOR);
  }
}
