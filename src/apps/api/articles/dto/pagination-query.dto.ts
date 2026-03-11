import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsBoolean, IsDateString } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Номер страницы',
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Размер страницы',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Фильтр по автору'
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Фильтр по статусу публикации'
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Фильтр по дате от (ISO 8601)'
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Фильтр по дате до (ISO 8601)'
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    example: 'nestjs',
    description: 'Поиск по заголовку и описанию'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
