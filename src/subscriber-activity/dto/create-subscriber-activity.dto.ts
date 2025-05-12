import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export enum platform {
  WEB = 'web',
  APP = 'app',
  MOBILE = 'mobile-app',
  IPHONE = 'iPhone-app',
}
class ModuleUsage {
  @ApiProperty({ description: 'Module Name', example: 'TB and Nutrition' })
  @IsString()
  module: string;

  @ApiProperty({ description: 'Time spent in minutes', example: 15 })
  @IsNumber()
  time: number;

  @ApiProperty({
    description: 'Sub-module ID',
    example: '67318d42dcc0a4af4b7a0b9b',
  })
  @IsMongoId()
  sub_module_id: string;

  @ApiProperty({ description: 'Activity type', example: 'submodule_usage' })
  @IsString()
  activity_type: string;

  @ApiProperty({ description: 'Activity ID', example: 63 })
  @IsNumber()
  id: number;
}
class Payload {
  @ApiProperty({ type: [ModuleUsage], description: 'List of module usages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleUsage) // Ensures correct transformation of nested objects
  moduleUsage: ModuleUsage[];
}

export class CreateSubscriberActivityDto {
  @ApiProperty({ description: 'User Id' })
  @IsOptional()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Module Name' })
  @IsNotEmpty()
  @IsString()
  module: string;

  @ApiProperty({ description: 'Type of Request' })
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Sub module Id name', required: false })
  @IsOptional()
  @IsMongoId()
  subModule?: Types.ObjectId;

  @ApiProperty({ description: 'Action Perform name' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Total Time required for sub Modules',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalTime?: number;

  @ApiProperty({ description: 'Time Spent for sub Modules', required: false })
  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @ApiProperty({ description: 'Module Completed or not', required: false })
  @IsOptional()
  @IsBoolean()
  completedFlag?: boolean;

  @ApiProperty({ description: 'Ip Address of User', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'Platform of User', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(platform, {
    message:
      'platform must be one of the following: app,web,mobile-app,iphone-app',
  })
  platform?: string;

  @ApiProperty({ description: 'Payload', required: false })
  @IsOptional()
  @IsObject()
  payload?: Payload;
}
