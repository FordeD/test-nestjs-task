import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModule } from '../../libs/config/config.module';
import { typeOrmConfig } from '../../libs/config/typeorm.config';
import { CacheModule } from '../../libs/redis/cache.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { User } from '../../libs/domain/user/user.entity';
import { Article } from '../../libs/domain/article/article.entity';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      entities: [User, Article],
    }),
    CacheModule,
    AuthModule,
    ArticlesModule,
  ],
})
export class AppModule {}
