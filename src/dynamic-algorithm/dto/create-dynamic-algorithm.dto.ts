import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class Title {
  @ApiProperty({ description: 'English Title' })
  @IsNotEmpty()
  @IsString()
  en: string;

  @ApiProperty({ description: 'Hindi Title', required: false })
  @IsOptional()
  @IsString()
  hi?: string;

  @ApiProperty({ description: 'Gujarati Title', required: false })
  @IsOptional()
  @IsString()
  gu?: string;

  @ApiProperty({ description: 'Marathi Title', required: false })
  @IsOptional()
  @IsString()
  mr?: string;

  @ApiProperty({ description: 'Telugu Title', required: false })
  @IsOptional()
  @IsString()
  te?: string;

  @ApiProperty({ description: 'Tamil Title', required: false })
  @IsOptional()
  @IsString()
  ta?: string;

  @ApiProperty({ description: 'Punjabi Title', required: false })
  @IsOptional()
  @IsString()
  pa?: string;

  @ApiProperty({ description: 'Kannada Title', required: false })
  @IsOptional()
  @IsString()
  kn?: string;
}
export class CreateDynamicAlgorithmDto {
  @ApiProperty({ description: 'Id of MySQL', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Dynamic Algo master Id of Dynamic Algorithm',
    required: false,
  })
  @IsNotEmpty()
  @IsMongoId()
  algoId?: Types.ObjectId;

  @ApiProperty({ description: 'Node Type of Dynamic Algorithm' })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of Dynamic Algorithm',
    default: false,
  })
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of Dynamic Algorithm',
    default: false,
  })
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({
    description: 'Time Spent on Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({
    description: 'Master Node Id of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  masterNodeId?: Types.ObjectId;

  @ApiProperty({ description: 'Index of Dynamic Algorithm' })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({ description: 'Header of Dynamic Algorithm', required: false })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node Id of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'State Ids of Dynamic Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Dynamic Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type of plugin management' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreType: string[];

  @ApiProperty({
    description: 'Cadre Ids of Dynamic Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Dynamic Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Dynamic Algorithm', required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Title)
  title: Title;

  @ApiProperty({ description: 'Icon of the Dynamic Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Description of Dynamic Algorithm',
    required: true,
  })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({
    description: 'Parent Id of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId;

  @ApiProperty({
    description: 'Active Status of Dynamic Algorithm',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Dynamic Algorithm',
    default: false,
  })
  @IsBoolean()
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Dynamic Algorithm',
    required: false,
  })
  @IsOptional()
  deletedAt?: Date | null;
}
