import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class QuestionDto {
  @ApiProperty({ description: 'Title of the question' })
  @IsNotEmpty({ message: 'Question title is required' })
  @IsObject({ message: 'Question title must be a string' })
  title: object;

  @ApiProperty({ description: 'Type of the question' })
  @IsNotEmpty({ message: 'Question type is required' })
  @IsString({ message: 'Question type must be a string' })
  type: string;

  @ApiProperty({ description: 'Option 1 for the question' })
  @IsOptional()
  @IsObject({ message: 'Option 1 must be a Object' })
  option1: object;

  @ApiProperty({ description: 'Option 2 for the question' })
  @IsOptional()
  @IsObject({ message: 'Option 2 must be a object' })
  option2: object;

  @ApiProperty({ description: 'Option 3 for the question' })
  @IsOptional()
  @IsObject({ message: 'Option 3 must be a object' })
  option3: object;

  @ApiProperty({ description: 'Option 4 for the question' })
  @IsOptional()
  @IsObject({ message: 'Option 4 must be a object' })
  option4: object;

  @ApiProperty({ description: 'Is the question active?' })
  @IsNotEmpty({ message: 'Active status is required' })
  @IsBoolean({ message: 'Active status must be a boolean' })
  active: boolean = true;

  @ApiProperty({ description: 'Order index of the question' })
  @IsNotEmpty({ message: 'Order index is required' })
  @IsInt({ message: 'Order index must be an integer' })
  @Min(1, { message: 'Order index must be at least 1' })
  orderIndex: number;
}

export class CreateSurveyMasterDto {
  @ApiProperty({ description: 'Title of the Survey' })
  @IsNotEmpty()
  @IsObject()
  // @Unique('survey-master', 'title', { message: 'title must be unique' })
  title: object;

  @ApiProperty({ description: 'Country id of the Survey' })
  @IsOptional()
  @IsString()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the Survey' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'State All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'District id of the Survey', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districtId?: Types.ObjectId[];

  @ApiProperty({ description: 'District All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Block id of the Survey', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockId?: Types.ObjectId[];

  @ApiProperty({ description: 'Block All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllBlock: boolean;

  @ApiProperty({
    description: 'Health Facility id of the Survey',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthFacilityId?: Types.ObjectId[];

  @ApiProperty({ description: 'Health Facility All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllHealthFacility: boolean;

  @ApiProperty({ description: 'Cadre id of the Survey' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'Cadre All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Cadre Type of the Survey', required: false })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreType?: string[];

  @ApiProperty({ description: 'Questions of Survey' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @ApiProperty({ description: 'Active Status of the Survey', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Send Initial Notification flag of the Survey',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sendInitialNotification?: boolean;
}
