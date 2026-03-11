import { Injectable } from '@nestjs/common';
import { ArticleService as DomainArticleService, CreateArticleDto, UpdateArticleDto } from '../../../libs/domain/article';
import { FindArticlesParams } from '../../../libs/repositories/article/article.repository';

@Injectable()
export class ArticlesService {
  constructor(private articleDomainService: DomainArticleService) {}

  async create(dto: CreateArticleDto) {
    return this.articleDomainService.create(dto);
  }

  async findAll(params: FindArticlesParams) {
    return this.articleDomainService.findAll(params);
  }

  async findOne(id: string) {
    return this.articleDomainService.findById(id);
  }

  async update(id: string, dto: UpdateArticleDto, userId: string) {
    return this.articleDomainService.update(id, dto, userId);
  }

  async remove(id: string, userId: string) {
    return this.articleDomainService.delete(id, userId);
  }

  async findByAuthor(authorId: string) {
    return this.articleDomainService.findByAuthorId(authorId);
  }
}
