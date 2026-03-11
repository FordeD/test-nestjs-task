import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Article } from './article.entity';
import { FindArticlesParams, PaginatedResult } from '../../types';

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private repository: Repository<Article>,
  ) {}

  /**
   * Создание новой статьи
   * Использует TypeORM create для создания экземпляра и save для записи в БД
   */
  async create(title: string, description: string, content: string, authorId: string): Promise<Article> {
    const article = this.repository.create({ title, description, content, authorId });
    return this.repository.save(article);
  }

  /**
   * Получение списка статей с пагинацией и фильтрацией
   * Поддерживает фильтры: по автору, статусу, дате публикации, поиску
   * Возвращает пагинированный результат с общим количеством записей
   */
  async findAll(params: FindArticlesParams): Promise<PaginatedResult<Article>> {
    const { page = 1, limit = 10, authorId, published, fromDate, toDate, search } = params;
    // Вычисление смещения для пагинации
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Article> = {};

    // Фильтр по автору и статусу публикации
    if (authorId) where.authorId = authorId;
    if (published !== undefined) where.published = published;

    // Фильтр по диапазону дат публикации
    if (fromDate || toDate) {
      where.publishedAt = Between(fromDate || new Date(0), toDate || new Date());
    }

    // Поиск по заголовку
    if (search) {
      where.title = Like(`%${search}%`);
    }

    // Выполнение запроса с подсчётом общего количества
    const [articles, total] = await this.repository.findAndCount({
      where,
      relations: ['author'], // Подгрузка данных автора
      skip, // Пропуск записей для пагинации
      take: limit, // Ограничение количества записей
      order: { publishedAt: 'DESC', createdAt: 'DESC' }, // Сортировка по дате
    });

    return {
      data: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получение статьи по ID с подгрузкой данных автора
   * Возвращает null если статья не найдена
   */
  async findById(id: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  /**
   * Обновление статьи
   * После обновления выполняет повторное получение статьи для возврата актуальных данных
   */
  async update(id: string, title: string, description: string, content: string, published: boolean, publishedAt?: Date): Promise<Article | null> {
    await this.repository.update(id, { title, description, content, published, publishedAt });
    return this.findById(id);
  }

  /**
   * Удаление статьи по ID
   * Не возвращает результат, выбрасывает ошибку при неудаче
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
