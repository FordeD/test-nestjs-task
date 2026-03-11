import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../domain/article/article.entity';
import { ArticleRepository } from './article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  providers: [ArticleRepository],
  exports: [ArticleRepository],
})
export class ArticleRepositoryModule {}
