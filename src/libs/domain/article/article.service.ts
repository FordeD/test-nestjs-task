import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '../../redis/cache.service';
import { ArticleRepository, FindArticlesParams, PaginatedResult } from '../../repositories/article/article.repository';

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

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private cacheService: CacheService,
  ) {}

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

  async findAll(params: FindArticlesParams): Promise<PaginatedResult<any>> {
    const cacheKey = this.getCacheKey('articles:list', params);

    const cached = await this.cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.articleRepository.findAll(params);
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

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

  async update(id: string, dto: UpdateArticleDto, userId: string) {
    const article = await this.findById(id);

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

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

    await this.cacheService.invalidateAll();
    await this.cacheService.del(`article:${id}`);
    
    return updatedArticle;
  }

  async delete(id: string, userId: string) {
    const article = await this.findById(id);

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articleRepository.delete(id);
    
    await this.cacheService.invalidateAll();
    await this.cacheService.del(`article:${id}`);
  }

  async findByAuthorId(authorId: string) {
    return this.articleRepository.findByAuthorId(authorId);
  }

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
