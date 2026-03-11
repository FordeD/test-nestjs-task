import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Article } from '../../domain/article/article.entity';

export interface FindArticlesParams {
  page?: number;
  limit?: number;
  authorId?: string;
  published?: boolean;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private repository: Repository<Article>,
  ) {}

  async create(title: string, description: string, content: string, authorId: string): Promise<Article> {
    const article = this.repository.create({ title, description, content, authorId });
    return this.repository.save(article);
  }

  async findAll(params: FindArticlesParams): Promise<PaginatedResult<Article>> {
    const { page = 1, limit = 10, authorId, published, fromDate, toDate, search } = params;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Article> = {};

    // Фильтр по автору и статусу публикации
    if (authorId) where.authorId = authorId;
    if (published !== undefined) where.published = published;

    // Фильтр по дате
    if (fromDate || toDate) {
      where.publishedAt = Between(fromDate || new Date(0), toDate || new Date());
    }

    // Поиск по заголовку или описанию
    if (search) {
      where.title = Like(`%${search}%`);
      where.description = Like(`%${search}%`);
    }

    const [articles, total] = await this.repository.findAndCount({
      where,
      relations: ['author'],
      skip,
      take: limit,
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });

    return {
      data: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Article | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async update(id: string, title: string, description: string, content: string, published: boolean, publishedAt?: Date): Promise<Article | null> {
    await this.repository.update(id, { title, description, content, published, publishedAt });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    return this.repository.find({
      where: { authorId },
      relations: ['author'],
      order: { publishedAt: 'DESC' },
    });
  }
}
