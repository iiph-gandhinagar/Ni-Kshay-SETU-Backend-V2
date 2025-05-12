import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserNotificationDto {
  @ApiProperty({ description: 'Title Of User Notification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description Of User Notification' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type Of User Notification' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Type Of User Notification' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userId: string[];

  @ApiProperty({ description: 'isAllUser', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllUser: boolean;

  @ApiProperty({ description: 'Country Id Of User Notification' })
  @IsOptional()
  @IsMongoId()
  countryId?: Types.ObjectId;

  @ApiProperty({ description: 'State Id Of User Notification' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  stateId?: Types.ObjectId[];

  @ApiProperty({ description: 'isAllState', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'District Id Of User Notification' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  districtId?: Types.ObjectId[];

  @ApiProperty({ description: 'isAllDistrict', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Cadre Type Of User Notification' })
  @IsOptional()
  @IsString()
  cadreType?: string;

  @ApiProperty({ description: 'Cadre Id Of User Notification' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreId?: Types.ObjectId[];

  @ApiProperty({ description: 'isAllCadre', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Created By Admin user Of User Notification' })
  @IsOptional()
  @IsMongoId()
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Deep-linking Status Of User Notification' })
  @IsOptional()
  @IsBoolean()
  isDeepLink: boolean;

  @ApiProperty({
    description: 'Automatic Notification type Of User Notification',
  })
  @IsOptional()
  @IsString()
  automaticNotificationType: string;

  @ApiProperty({ description: 'Type of notification Of User Notification' })
  @IsOptional()
  @IsObject()
  typeTitle: object;

  @ApiProperty({ description: 'Successful count Of User Notification' })
  @IsOptional()
  @IsNumber()
  successfulCount: number;

  @ApiProperty({ description: 'Failed count Of User Notification' })
  @IsOptional()
  @IsNumber()
  failedCount: number;

  @ApiProperty({ description: 'Status Of User Notification' })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({ description: 'Redirect Link of User Notification' })
  @IsOptional()
  @IsUrl()
  link: string;

  @ApiProperty({ description: 'Assessment Title Of User Notification' })
  @IsOptional()
  @IsString()
  assessmentTitle: string;

  @ApiProperty({ description: 'Time To Completed Of User Notification' })
  @IsOptional()
  @IsString()
  timeToCompleted: string;
}
