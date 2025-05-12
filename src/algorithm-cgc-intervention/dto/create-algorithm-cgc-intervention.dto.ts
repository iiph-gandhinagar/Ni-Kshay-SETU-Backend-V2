import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

class Title {
  @ApiProperty({ description: 'Title in English', example: 'English Title' })
  @IsNotEmpty()
  @IsString()
  en: string;

  @ApiProperty({ description: 'Title in Hindi', example: 'Hindi Title' })
  @IsOptional()
  @IsString()
  hi: string;

  @ApiProperty({ description: 'Title in Gujarati', example: 'Gujarati Title' })
  @IsOptional()
  @IsString()
  gu: string;
}

export class CreateAlgorithmCgcInterventionDto {
  @ApiProperty({ description: 'Id of MySQL', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Node Type of CGC Intervention Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of CGC Intervention Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of CGC Intervention Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({
    description: 'Time Spent of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({
    description: 'Master Node Id of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  masterNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'Index of CGC Intervention Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({
    description: 'Header of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'Redirect Algo Type of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node Id of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'State Ids of CGC Intervention Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type of plugin management' })
  @IsString()
  @IsNotEmpty()
  cadreType: string;

  @ApiProperty({
    description: 'Cadre Ids of CGC Intervention Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({
    description: 'Title of CGC Intervention Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Title)
  title: Title;

  @ApiProperty({ description: 'Icon of the Diagnosis Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Description of CGC Intervention Algorithm',
    required: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Title)
  description: Title;

  @ApiProperty({
    description: 'Parent Id of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification?: boolean;

  @ApiProperty({
    description: 'Deleted date and time of CGC Intervention Algorithm',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
