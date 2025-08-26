import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);
    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.email);
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload, { secret: 'ACCESS_SECRET', expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { secret: 'REFRESH_SECRET', expiresIn: '7d' });

    await this.usersService.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }
}
