import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../repositories/user/user.entity';
import { Article } from '../repositories/article/article.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nestjs_api',
  entities: [User, Article],
  synchronize: false,
  migrationsRun: false,
};
