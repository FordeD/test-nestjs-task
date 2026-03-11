import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ApiSchema({ name: 'Login' })
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email адрес'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
