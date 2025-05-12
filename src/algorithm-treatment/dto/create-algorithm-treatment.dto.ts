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
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAlgorithmTreatmentDto {
  @ApiProperty({ description: 'Id of mysql', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Node Type of Treatment Algorithm' })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({ description: 'Expandable Status of Treatment Algorithm' })
  @IsOptional()
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({ description: 'Has Option Status of Treatment Algorithm' })
  @IsOptional()
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({
    description: 'Time Spent of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({
    description: 'Master Node Id of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @Type(() => Types.ObjectId)
  masterNodeId?: Types.ObjectId;

  @ApiProperty({ description: 'Index of Treatment Algorithm' })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({
    description: 'Header of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node id of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'State Ids of Treatment Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Types.ObjectId)
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type of plugin management' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreType: string[];

  @ApiProperty({
    description: 'Cadre Ids of Treatment Algorithm',
    required: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Types.ObjectId)
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Treatment Algorithm', required: true })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Icon of the Treatment Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Description of Treatment Algorithm',
    required: true,
  })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({
    description: 'ParentId of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @Type(() => Types.ObjectId)
  parentId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of Treatment Algorithm',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activated: boolean = true;

  @ApiProperty({
    description: 'Send Initial Notification of Treatment Algorithm',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification: boolean = false;

  @ApiProperty({
    description: 'Deleted date and time of Treatment Algorithm',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
