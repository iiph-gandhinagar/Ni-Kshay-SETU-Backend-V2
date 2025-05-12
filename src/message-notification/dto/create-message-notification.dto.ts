import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageNotificationDto {
  @ApiProperty({ description: 'Message' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
