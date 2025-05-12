import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAutomaticNotificationDto {
  @ApiProperty({ description: 'User IDs for Automatic Notification' })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  userId: Types.ObjectId[];

  @ApiProperty({ description: 'Title of Automatic Notification' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of Automatic Notification' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of Automatic Notification' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Redirect Link of Automatic Notification' })
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @ApiProperty({ description: 'Created By ID for Automatic Notification' })
  @IsNotEmpty()
  @IsMongoId()
  createdBy: Types.ObjectId;

  @ApiProperty({
    description: 'Count of successfully sent Automatic Notifications',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  successfulCount: boolean;

  @ApiProperty({
    description: 'Count of failed Automatic Notifications',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  failedCount: boolean;

  @ApiProperty({
    description: 'Status of Automatic Notification',
    default: false,
  })
  @IsOptional()
  @IsString()
  status: string;
}
