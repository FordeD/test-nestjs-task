import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ApiSchema({ name: 'CreateArticle' })
export class CreateArticleDto {
  @ApiProperty({
    example: 'Моя статья',
    description: 'Заголовок статьи',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Краткое описание статьи',
    description: 'Описание статьи',
    minLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: 'Полный текст статьи',
    description: 'Содержимое статьи',
    minLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  content: string;
}
