import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeleteAccountCountDto {
  @ApiProperty({ description: 'Count Of Delete Account' })
  @IsNotEmpty()
  @IsNumber()
  count: number;

  @ApiProperty({ description: 'Type of Count' })
  @IsNotEmpty()
  @IsString()
  type: string;
}
