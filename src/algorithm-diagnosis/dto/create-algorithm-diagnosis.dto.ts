import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAlgorithmDiagnosisDto {
  @ApiProperty({ description: 'Id of mysql', required: false })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Node Type of Diagnosis Algorithm' })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({ description: 'Expandable Status of Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({ description: 'Has Option Status of Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({ description: 'Master Node Id of Diagnosis Algorithm' })
  @IsOptional()
  @IsMongoId()
  masterNodeId: Types.ObjectId;

  @ApiProperty({
    description: 'Time Spent of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({ description: 'Index of Diagnosis Algorithm' })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({ description: 'State Ids of Diagnosis Algorithm' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
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

  @ApiProperty({ description: 'Cadre Ids of Diagnosis Algorithm' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the Diagnosis Algorithm' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Diagnosis Algorithm' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Icon of the Diagnosis Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({ description: 'Description of Diagnosis Algorithm' })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({
    description: 'Header of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'ParentId of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId: Types.ObjectId | null;

  @ApiProperty({
    description: 'Redirect Algo Type of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node Id of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'Active Status of Diagnosis Algorithm',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Diagnosis Algorithm',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Diagnosis Algorithm',
    required: false,
  })
  @IsOptional()
  deletedAt: Date | null;
}
