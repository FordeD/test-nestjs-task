import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  /**
   * Создание нового пользователя
   * Принимает уже захешированный пароль
   */
  async create(email: string, password: string, name: string): Promise<User> {
    const user = this.repository.create({ email, password, name });
    return this.repository.save(user);
  }

  /**
   * Поиск пользователя по email
   * Используется для аутентификации
   * Возвращает null если пользователь не найден
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Поиск пользователя по ID
   * Используется для валидации пользователя из токена
   * Возвращает null если пользователь не найден
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Проверка существования пользователя по email
   * Используется при регистрации для предотвращения дубликатов
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.repository.exists({ where: { email } });
  }
}
