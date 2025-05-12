import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchQueriesDto {
  @ApiProperty({ description: 'Session Id of the message' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'Query Id of the message' })
  @IsString()
  @IsOptional()
  query: string;

  @ApiProperty({ description: 'Id of the Question' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'NTEP Id of the Question' })
  @IsNumber()
  @IsOptional()
  NTEPId: number;
}
