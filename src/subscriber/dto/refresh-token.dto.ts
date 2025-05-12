import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token provided during login' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({ description: 'User Id provided during login' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
