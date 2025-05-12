import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchAiQueryDto {
  @ApiProperty({ description: 'Session Id of the message' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'Query Id of the message' })
  @IsString()
  @IsOptional()
  query: string;

  @ApiProperty({ description: 'Platform Details' })
  @IsString()
  @IsOptional()
  platform: string;
}
