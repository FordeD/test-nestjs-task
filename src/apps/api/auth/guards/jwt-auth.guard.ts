import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Guard для защиты маршрутов
 * Расширяет AuthGuard с стратегией 'jwt'
 * Автоматически проверяет наличие валидного JWT токена в заголовке Authorization
 * Используется через декоратор @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
