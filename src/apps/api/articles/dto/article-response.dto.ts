import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({
    example: 'uuid'
  })
  id: string;

  @ApiProperty({
    example: 'John'
  })
  name: string;

  @ApiProperty({
    example: 'john@example.com'
  })
  email: string;
}

export class ArticleResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID статьи'
  })
  id: string;

  @ApiProperty({
    example: 'Моя статья',
    description: 'Заголовок статьи'
  })
  title: string;

  @ApiProperty({
    example: 'Краткое описание статьи',
    description: 'Описание статьи'
  })
  description: string;

  @ApiProperty({
    example: 'Полный текст статьи',
    description: 'Содержимое статьи'
  })
  content: string;

  @ApiProperty({
    example: false,
    description: 'Опубликована ли статья'
  })
  published: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Дата публикации',
    required: false
  })
  publishedAt: Date | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID автора'
  })
  authorId: string;

  @ApiProperty({
    type: AuthorDto,
    description: 'Автор статьи',
    required: false
  })
  author?: AuthorDto;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Дата создания'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z', description: 'Дата обновления'
  })
  updatedAt: Date;
}

export class PaginatedArticlesResponseDto {
  @ApiProperty({
    type: [ArticleResponseDto],
    description: 'Список статей'
  })
  data: ArticleResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Общее количество статей'
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Текущая страница'
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Размер страницы'
  })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'Общее количество страниц'
  })
  totalPages: number;
}
