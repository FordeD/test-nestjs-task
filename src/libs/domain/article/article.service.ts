import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '../../redis/cache.service';
import { ArticleRepository } from '../../repositories/article/article.repository';
import { FindArticlesParams, PaginatedResult } from '../../types';

export interface CreateArticleDto {
  title: string;
  description: string;
  content: string;
  authorId: string;
}

export interface UpdateArticleDto {
  title: string;
  description: string;
  content: string;
  published: boolean;
}

/**
 * Доменный сервис для управления статьями
 * Содержит основную бизнес-логику и кэширование
 */
@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private cacheService: CacheService,
  ) {}

  /**
   * Создание новой статьи
   * После создания инвалидирует весь кэш
   */
  async create(dto: CreateArticleDto) {
    const article = await this.articleRepository.create(
      dto.title,
      dto.description,
      dto.content,
      dto.authorId,
    );
    await this.cacheService.invalidateAll();
    return article;
  }

  /**
   * Получение списка статей с пагинацией и фильтрацией
   * Использует кэширование: сначала проверяет Redis, при отсутствии - запрос в БД
   * Ключ кэша формируется динамически на основе параметров запроса
   * TTL кэша - 300 секунд (5 минут)
   */
  async findAll(params: FindArticlesParams): Promise<PaginatedResult<any>> {
    // Формирование уникального ключа кэша на основе параметров
    const cacheKey = this.getCacheKey('articles:list', params);

    // Проверка наличия данных в кэше
    const cached = await this.cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Запрос к репозиторию при отсутствии в кэше
    const result = await this.articleRepository.findAll(params);
    // Сохранение результата в кэш
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  /**
   * Получение статьи по ID
   * Использует кэширование по ключу article:{id}
   * TTL кэша - 300 секунд (5 минут)
   */
  async findById(id: string) {
    const cacheKey = `article:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, article, 300);
    return article;
  }

  /**
   * Обновление статьи
   * Проверяет права доступа - только автор может редактировать
   * При публикации устанавливает текущую дату в publishedAt
   * Инвалидирует весь кэш и кэш конкретной статьи
   */
  async update(id: string, dto: UpdateArticleDto, userId: string) {
    const article = await this.findById(id);

    // Проверка: только автор может редактировать статью
    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    // Установка даты публикации при включении флага published
    const publishedAt = dto.published ? new Date() : (article.publishedAt || null);
    const updatedArticle = await this.articleRepository.update(
      id,
      dto.title,
      dto.description,
      dto.content,
      dto.published,
      publishedAt || undefined,
    );
    if (!updatedArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Инвалидация кэша после обновления
    await this.cacheService.invalidateAll();
    await this.cacheService.del(`article:${id}`);
    
    return updatedArticle;
  }

  /**
   * Удаление статьи
   * Проверяет права доступа - только автор может удалять
   * Инвалидирует весь кэш и кэш конкретной статьи
   */
  async delete(id: string, userId: string) {
    const article = await this.findById(id);

    // Проверка: только автор может удалять статью
    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articleRepository.delete(id);
    
    await this.cacheService.invalidateAll();
    await this.cacheService.del(`article:${id}`);
  }

  /**
   * Формирование уникального ключа кэша на основе параметров запроса
   * Используется для кэширования результатов поиска с фильтрами
   */
  private getCacheKey(prefix: string, params: FindArticlesParams): string {
    const parts = [prefix];
    if (params.page) parts.push(`p${params.page}`);
    if (params.limit) parts.push(`l${params.limit}`);
    if (params.authorId) parts.push(`a${params.authorId}`);
    if (params.published !== undefined) parts.push(`pub${params.published}`);
    if (params.fromDate) parts.push(`f${params.fromDate.toISOString()}`);
    if (params.toDate) parts.push(`t${params.toDate.toISOString()}`);
    if (params.search) parts.push(`s${params.search}`);
    return parts.join(':');
  }
}
