import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'AuthResponse' })
export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT токен доступа'
  })
  access_token: string;
}
