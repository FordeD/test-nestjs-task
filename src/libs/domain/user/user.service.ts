import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/user/user.repository';
import { LoginUserDto, RegisterUserDto } from '../../types';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Регистрация нового пользователя
   * Проверяет уникальность email
   * Хеширует пароль перед сохранением в БД
   * Возвращает данные пользователя без пароля
   */
  async register(dto: RegisterUserDto) {
    // Проверка: email должен быть уникальным
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    // Хеширование пароля с солью (10 раундов)
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create(dto.email, hashedPassword, dto.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Аутентификация пользователя по email и паролю
   * Проверяет существование пользователя
   * Сравнивает хеш пароля с сохранённым в БД
   * Возвращает данные пользователя без пароля
   */
  async login(dto: LoginUserDto) {
    // Поиск пользователя по email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Сравнение введённого пароля с хешем в БД
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Получение пользователя по ID
   * Используется для валидации пользователя из JWT токена
   * Выбрасывает UnauthorizedException если пользователь не найден
   */
  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
