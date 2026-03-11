import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService, RegisterUserDto, LoginUserDto } from '../../../libs/domain/user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.userService.register(dto);
    return this.generateTokens(user);
  }

  async login(dto: LoginUserDto) {
    const user = await this.userService.login(dto);
    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.userService.getById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    return this.userService.getById(userId);
  }

  private generateTokens(user: { id: string; email: string }) {
    const [accessToken, refreshToken] = [
      this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_SECRET || 'secret',
          expiresIn: '15m', // Короткий TTL для access токена
        },
      ),
      this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
          expiresIn: '7d', // Долгий TTL для refresh токена
        },
      ),
    ];

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
