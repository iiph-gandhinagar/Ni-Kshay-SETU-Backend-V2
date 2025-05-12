import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAll3rdPartyApisResponseDto {
  @ApiProperty({
    description: 'name of node',
    example: 'nodes',
  })
  @IsString()
  @IsNotEmpty()
  api: string;

  @ApiProperty({ description: 'Status of API', example: 'OK' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Error message / message',
    example: 'API is working fine',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
