import { Module } from '@nestjs/common';
import { ArticleRepositoryModule } from '../../repositories/article';
import { ArticleService } from './article.service';

@Module({
  imports: [ArticleRepositoryModule],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
