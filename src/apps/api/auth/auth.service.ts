import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../libs/domain/user';
import { LoginUserDto, RegisterUserDto } from '../../../libs/types';

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

  /**
   * Обновление пары токенов с использованием refresh токена
   * Верифицирует refresh токен и получает данные пользователя из payload
   * При неудачной верификации выбрасывает UnauthorizedException
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Верификация refresh токена с использованием отдельного секрета
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      // Получение данных пользователя по ID из токена
      const user = await this.userService.getById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    return this.userService.getById(userId);
  }

  /**
   * Генерация пары access и refresh токенов
   * Access токен - короткоживущий (15 минут) для авторизации запросов
   * Refresh токен - долгоживущий (7 дней) для обновления access токена
   */
  private generateTokens(user: { id: string; email: string }) {
    const [accessToken, refreshToken] = [
      // Access токен с коротким временем жизни
      this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_SECRET || 'secret',
          expiresIn: '15m', // Короткий TTL для access токена
        },
      ),
      // Refresh токен с длительным временем жизни
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
