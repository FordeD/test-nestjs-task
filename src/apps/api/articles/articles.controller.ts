import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, PaginationQueryDto, UpdateArticleDto } from './dto';

@ApiTags('Articles')
@Controller('articles')
@ApiExtraModels(CreateArticleDto, UpdateArticleDto, PaginationQueryDto)
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую статью' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({
    status: 201,
    description: 'Статья создана',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        title: { type: 'string', example: 'Моя статья' },
        description: { type: 'string', example: 'Описание' },
        content: { type: 'string', example: 'Текст статьи' },
        published: { type: 'boolean', example: false },
        publishedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        authorId: { type: 'string', example: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  async create(@Body() dto: CreateArticleDto, @Request() req) {
    return this.articlesService.create({
      title: dto.title,
      description: dto.description,
      content: dto.content,
      authorId: req.user.userId,
    });
  }

  @Get()
  @ApiOperation({ 
    summary: 'Получить список статей с пагинацией и фильтрацией',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Размер страницы' })
  @ApiQuery({ name: 'authorId', required: false, type: String, description: 'Фильтр по автору' })
  @ApiQuery({ name: 'published', required: false, type: Boolean, description: 'Фильтр по статусу публикации' })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'Фильтр по дате от (ISO 8601)' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'Фильтр по дате до (ISO 8601)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Поиск по заголовку и описанию' })
  @ApiResponse({
    status: 200,
    description: 'Список статей с пагинацией',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.articlesService.findAll({
      page: query.page,
      limit: query.limit,
      authorId: query.authorId,
      published: query.published,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      search: query.search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить статью по ID' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Статья найдена' })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статью (только автор)' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: 'Статья обновлена' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Только автор может редактировать статью' })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Request() req) {
    return this.articlesService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить статью (только автор)' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Статья удалена' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiResponse({ status: 403, description: 'Только автор может удалять статью' })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    return this.articlesService.remove(id, req.user.userId);
  }
}
