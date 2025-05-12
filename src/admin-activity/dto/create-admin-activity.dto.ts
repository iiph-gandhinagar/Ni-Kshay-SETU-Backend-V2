import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAdminActivityDto {
  @ApiProperty({ description: 'Action Details like (Create, Edit, Delete)' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ description: 'Module name' })
  @IsNotEmpty()
  @IsString()
  moduleName: string;

  @ApiProperty({ description: 'ID of the admin user who caused the action' })
  @IsOptional()
  @IsMongoId()
  causerId: Types.ObjectId;

  @ApiProperty({ description: 'Payload of the action' })
  @IsNotEmpty()
  @IsObject()
  payload: object;
}
