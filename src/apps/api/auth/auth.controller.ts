import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpStatus as Status,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, TokensResponseDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
@ApiExtraModels(RegisterDto, LoginDto, RefreshTokenDto, TokensResponseDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: { $ref: getSchemaPath(TokensResponseDto) },
  })
  @ApiResponse({ status: 409, description: 'Email уже зарегистрирован' })
  @HttpCode(Status.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200,
    description: 'Успешный вход',
    schema: { $ref: getSchemaPath(TokensResponseDto) },
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access токена через refresh токен' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200,
    description: 'Токены обновлены',
    schema: { $ref: getSchemaPath(TokensResponseDto) },
  })
  @ApiResponse({ status: 401, description: 'Неверный refresh токен' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }
}
