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

export class CreateAlgorithmGuidanceOnAdverseDrugReactionDto {
  @ApiProperty({ description: 'Id of MySQL', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Node Type of Guidance on ADR Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of Guidance on ADR Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of Guidance on ADR Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({
    description: 'Time Spent of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({
    description: 'Master Node Id of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  masterNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'Index of Guidance on ADR Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({
    description: 'Header of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node Id of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'State Ids of Guidance on ADR Algorithm',
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
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreType: string[];

  @ApiProperty({
    description: 'Cadre Ids of Guidance on ADR Algorithm',
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
    description: 'Title of Guidance on ADR Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Icon of the Guidance on ADR Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Description of Guidance on ADR Algorithm',
    required: true,
  })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({
    description: 'ParentId of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification?: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Guidance on ADR Algorithm',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
