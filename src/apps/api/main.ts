import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ArticleResponseDto, CreateArticleDto, PaginatedArticlesResponseDto, UpdateArticleDto } from './articles/dto';
import { LoginDto, RefreshTokenDto, RegisterDto, TokensResponseDto } from './auth/dto';

async function bootstrap() {
  // Создание экземпляра NestJS приложения
  const app = await NestFactory.create(AppModule);

  // Глобальная настройка валидации DTO
  // whitelist - удаляет свойства, не указанные в DTO
  // forbidNonWhitelisted - выбрасывает ошибку при наличии лишних свойств
  // transform - автоматически преобразует типы данных
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('Test NestJS API')
    .setVersion('1.0')
    .addBearerAuth() // Добавляет кнопку авторизации с JWT токеном
    .build();

  // Генерация документа Swagger с дополнительными моделями DTO
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      RegisterDto,
      LoginDto,
      RefreshTokenDto,
      TokensResponseDto,
      CreateArticleDto,
      UpdateArticleDto,
      ArticleResponseDto,
      PaginatedArticlesResponseDto,
    ],
  });

  // Размещение Swagger UI по пути /api/docs
  // persistAuthorization - сохраняет токен при перезагрузке страницы
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'NestJS API Docs',
  });

  // Запуск сервера на указанном порту
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
