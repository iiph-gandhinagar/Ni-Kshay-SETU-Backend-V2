import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateOldAssessmentResultDto {
  @ApiProperty({ description: 'Assessment Details', type: String })
  @IsMongoId()
  assessmentId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Details', type: String })
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Total Marks of the Assessment' })
  @IsNumber()
  @IsOptional()
  TotalMarks: number;

  @ApiProperty({ description: 'Total Time of the Assessment' })
  @IsNumber()
  @IsOptional()
  totalTime: number;

  @ApiProperty({ description: 'Obtained Marks', default: 0 })
  @IsNumber()
  @IsOptional()
  obtainedMarks: number;

  @ApiProperty({ description: 'Number of Questions Attempted', default: 0 })
  @IsNumber()
  @IsOptional()
  attempted: number;

  @ApiProperty({ description: 'Number of Right Answers', default: 0 })
  @IsNumber()
  @IsOptional()
  rightAnswer: number;

  @ApiProperty({ description: 'Number of Wrong Answers', default: 0 })
  @IsNumber()
  @IsOptional()
  wrongAnswer: number;

  @ApiProperty({ description: 'Number of Skipped Questions', default: 0 })
  @IsNumber()
  @IsOptional()
  skipped: number;

  @ApiProperty({ description: 'Is Marks Calculated', default: false })
  @IsBoolean()
  @IsOptional()
  isCalculated?: boolean;

  @ApiProperty({ description: 'Time TO Complete assessment', default: false })
  @IsString()
  @IsOptional()
  timeToComplete?: string;

  @ApiProperty({ description: 'Type of assessment', default: false })
  @IsString()
  @IsOptional()
  assessmentType?: string;

  @ApiProperty({ description: 'Activate assessment', default: false })
  @IsBoolean()
  @IsOptional()
  activated?: boolean;

  @ApiProperty({ description: 'Assessment Cadre Details', type: String })
  @IsArray()
  @IsMongoId({ each: true })
  cadreId: Types.ObjectId;

  @ApiProperty({ description: 'Assessment Country Details', type: String })
  @IsArray()
  @IsMongoId({ each: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'Assessment District Details', type: String })
  @IsArray()
  @IsMongoId({ each: true })
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Assessment State Details', type: String })
  @IsArray()
  @IsMongoId({ each: true })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'Type of cadre', default: false })
  @IsString()
  @IsOptional()
  cadreType?: string;

  @ApiProperty({ description: 'From Date', default: false })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({ description: 'To Date', default: false })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiProperty({ description: 'Assessment Title', default: false })
  @IsString()
  @IsOptional()
  title?: string;
}
