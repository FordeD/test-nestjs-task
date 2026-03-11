import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisConfig } from '../config/redis.config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    // Асинхронная регистрация кэша с использованием Redis
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: redisConfig,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
