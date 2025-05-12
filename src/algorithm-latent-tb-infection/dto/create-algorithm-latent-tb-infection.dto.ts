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

export class CreateAlgorithmLatentTbInfectionDto {
  @ApiProperty({ description: 'Id of MySQL', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Node Type of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  hasOptions: boolean;

  @ApiProperty({
    description: 'Time Spent of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeSpent?: string;

  @ApiProperty({
    description: 'Master Node Id of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  masterNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'Index of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @ApiProperty({
    description: 'Header of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  header?: object;

  @ApiProperty({
    description: 'Sub Header of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsObject()
  subHeader?: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectAlgoType?: string;

  @ApiProperty({
    description: 'Redirect Node Id of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  redirectNodeId?: Types.ObjectId;

  @ApiProperty({
    description: 'State Ids of Latent Tb Infection Algorithm',
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
    description: 'Cadre Ids of Latent Tb Infection Algorithm',
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
    description: 'Title of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Icon of the Latent Tb Infection Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Description of Latent Tb Infection Algorithm',
    required: true,
  })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({
    description: 'ParentId of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification?: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Latent Tb Infection Algorithm',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date | null;
}
