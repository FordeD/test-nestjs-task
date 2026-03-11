import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, MinLength } from 'class-validator';

@ApiSchema({ name: 'UpdateArticle' })
export class UpdateArticleDto {
  @ApiProperty({
    example: 'Обновленный заголовок',
    description: 'Заголовок статьи',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Обновленное описание',
    description: 'Описание статьи',
    minLength: 10
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: 'Обновленный текст статьи',
    description: 'Содержимое статьи',
    minLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  content: string;

  @ApiProperty({
    example: true,
    description: 'Статус публикации'
  })
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
