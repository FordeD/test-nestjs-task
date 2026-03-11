# NestJS API Test

REST API с аутентификацией, CRUD операциями и кэшированием.

## Технологии

- NestJS
- TypeORM + PostgreSQL (Docker)
- Redis (Docker, кэширование)
- JWT (авторизация + refresh токен)
- Swagger (документация)

## Быстрый старт

### 1. Запуск окружения (PostgreSQL + Redis)

```bash
docker-compose up -dV
```

### 2. Применение миграций (создание таблиц)

```bash
npm run migration:run
```

### 3. Запуск дев сервера без сборки

```bash
npm run start:dev
```

### 4. Production сборка и запуск

```bash
npm run build
npm run start:prod
```

## Миграции

Конфигурация миграций находится в отдельном файле `src/libs/config/data-source.config.ts` и не зависит от NestJS.

Миграции обнаруживаются **автоматически** из папки `src/migrations/` по паттерну `*{.ts,.js}`.

```bash
# Применить миграции
npm run migration:run
```

### Как работают миграции:

1. **Динамическое обнаружение**: Все файлы в `src/migrations/` автоматически находятся по паттерну
2. **Ручной запуск**: Миграции применяются через `npm run migration:run`
3. **Таблица миграций**: TypeORM создаёт таблицу `migrations` для отслеживания применённых миграций
4. **Идемпотентность**: Повторный запуск применяет только новые миграции

### Пример добавления новой миграции:

1. Создайте файл в `src/migrations/`:
```bash
src/migrations/1773237761010-add-new-migration.ts
```

2. Запустите миграции:
```bash
npm run migration:run
```

## API Документация

После запуска приложения откройте http://localhost:3000/api/docs

## Endpoints

### Auth
- `POST /auth/register` - Регистрация (возвращает access + refresh токены)
- `POST /auth/login` - Логин (возвращает access + refresh токены)
- `POST /auth/refresh` - Обновление access токена через refresh токен

### Articles
- `GET /articles` - Получить список статей
- `GET /articles/:id` - Получить статью по ID
- `POST /articles` - Создать статью (требуется токен)
- `PUT /articles/:id` - Обновить статью (требуется токен автора)
- `DELETE /articles/:id` - Удалить статью (требуется токен автора)

## CRUD Статьи

### Структура статьи:
- `title` - заголовок (мин. 3 символа)
- `description` - краткое описание (мин. 10 символов)
- `content` - полное содержимое (мин. 20 символов)
- `published` - статус публикации
- `publishedAt` - дата публикации (устанавливается автоматически)
- `author` - автор статьи

### Пагинация и фильтрация:

```bash
# Пагинация
GET /articles?page=1&limit=10

# Фильтр по автору
GET /articles?authorId=uuid

# Фильтр по статусу публикации
GET /articles?published=true

# Фильтр по дате публикации
GET /articles?fromDate=2024-01-01&toDate=2024-12-31

# Поиск по заголовку и описанию
GET /articles?search=keyword

# Комбинированный запрос
GET /articles?page=1&limit=10&published=true&search=nestjs
```

### Ответ с пагинацией:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## JWT Токены

- **Access токен**: короткоживущий (15 минут), используется для авторизации запросов
- **Refresh токен**: долгоживущий (7 дней), используется для получения новой пары токенов

## Кэширование

- Список статей кэшируется в Redis на 5 минут
- Ключ кэша формируется на основе параметров запроса (пагинация, фильтры)
- Кэш инвалидируется при создании, обновлении или удалении статьи
- Отдельные статьи кэшируются по ключу `article:{id}`

## Тестирование

### Postman коллекция
Импортируйте `NestJS_API.postman_collection.json` в Postman для ручного тестирования API.
