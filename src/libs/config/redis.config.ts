import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisConfig = async (): Promise<CacheModuleOptions> => {
  const store = await redisStore({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    ttl: parseInt(process.env.REDIS_TTL || '300', 10),
  });

  return {
    store: store as any,
  };
};
