import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Извлечение токена из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Отклонять истёкшие токены
      ignoreExpiration: false,
      // Секрет для верификации токена (должен совпадать с тем, что использовался при подписи)
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  /**
   * Метод валидации payload токена
   * Вызывается автоматически после успешной верификации токена
   * Возвращает объект пользователя, который сохраняется в req.user
   */
  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email };
  }
}
