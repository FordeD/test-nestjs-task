import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'TokensResponse' })
export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access токен (короткоживущий, 15 минут)'
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh токен (долгоживущий, 7 дней)'
  })
  refresh_token: string;
}
