import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserAppVersionDto {
  @ApiProperty({
    description: 'User ID associated with the app version',
    type: String,
    example: '605c72ef3f1a2b6f90ec7a4b',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'User Name associated with the app version',
    type: String,
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'App version of the user',
    type: String,
    example: '1.0.5',
  })
  @IsNotEmpty()
  @IsString()
  appVersion: string;

  @ApiProperty({
    description:
      'Current platform of the user’s app (iPhone-app, mobile-app, web)',
    type: String,
    example: 'iPhone-app',
  })
  @IsNotEmpty()
  @IsString()
  currentPlatform: string;

  @ApiProperty({
    description: 'Has iOS app version (true/false)',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasIos: boolean;

  @ApiProperty({
    description: 'Has Android app version (true/false)',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasAndroid: boolean;

  @ApiProperty({
    description: 'Has Web app version (true/false)',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasWeb: boolean;
}
