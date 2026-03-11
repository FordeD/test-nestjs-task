import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@ApiSchema({ name: 'Register' })
export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email адрес'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Имя пользователя'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
