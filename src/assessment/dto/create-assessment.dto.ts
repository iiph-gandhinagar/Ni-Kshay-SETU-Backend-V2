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
import { DependentQuestion } from 'src/common/decorators/dependentQuestion.decorator';
import { OneOfTwoFields } from 'src/common/decorators/OneOfTwoFieldsConstraint.decorator';
import { Unique } from 'src/common/decorators/unique.validator';

class AssessmentQuestionDto {
  @ApiProperty({ description: 'The question text' })
  @IsObject()
  question: object;

  @ApiProperty({ description: 'Option 1' })
  @IsObject()
  option1: object;

  @ApiProperty({ description: 'Option 2' })
  @IsObject()
  option2: object;

  @ApiProperty({ description: 'Option 3' })
  @IsObject()
  option3: object;

  @ApiProperty({ description: 'Option 4' })
  @IsObject()
  option4: object;

  @ApiProperty({ description: 'Correct answer' })
  @IsString()
  correctAnswer: string;

  @ApiProperty({ description: 'Category of the question' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Explanation for the correct answer' })
  @IsObject()
  explanation: object;

  @ApiProperty({ description: 'Visibility of the question', default: false })
  @IsBoolean()
  isVisible: boolean;
}

export class CreateAssessmentDto {
  @ApiProperty({
    description: 'Title of Assessment',
    type: Object,
    example: {
      en: 'Trial Assessment',
      gu: 'ટ્રાયલ એસેસમેન્ટ',
      hi: 'परीक्षण मूल्यांकन',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Unique('assessment', 'title', { message: 'title must be unique' })
  title: object;

  @ApiProperty({ description: 'Language of assessment' })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiProperty({ description: 'Cadre Type', example: 'State_Level' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreType: string;

  @ApiProperty({ description: 'Time To complete Assessment', example: 60 })
  @IsNotEmpty()
  @IsNumber()
  timeToComplete: number;

  @ApiProperty({
    description: 'Country ID',
    example: '6666c830eb18953046b1b56b',
  })
  @IsOptional()
  @IsMongoId()
  @DependentQuestion('cadreType', 'National_Level', {
    message: 'Country is required when cadre Type is "National_Level".',
  })
  countryId: Types.ObjectId;

  @ApiProperty({
    description: 'State ID',
    type: [String],
    example: ['66681c0cc90ce4f3659fb705', '66681c48c90ce4f3659fb707'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @DependentQuestion('cadreType', 'State_Level', {
    message: 'State is required when cadre Type is "State_Level".',
  })
  stateId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'isAllState', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({
    description: 'District ID',
    type: [String],
    example: ['669def66dabdb8f05c960be6', '669def68dabdb8f05c960bee'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @DependentQuestion('cadreType', 'District_Level', {
    message: 'District is required when cadre Type is "District_Level".',
  })
  districtId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'isAllDistrict', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllDistrict: boolean;

  @ApiProperty({
    description: 'Block ID',
    type: [String],
    example: ['669def66dabdb8f05c960be6', '669def68dabdb8f05c960bee'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @DependentQuestion('cadreType', 'Block_Level', {
    message: 'Block is required when cadre Type is "Block_Level".',
  })
  blockId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'isAllBlock', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllBlock: boolean;

  @ApiProperty({
    description: 'District ID',
    type: [String],
    example: ['669def66dabdb8f05c960be6', '669def68dabdb8f05c960bee'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @DependentQuestion('cadreType', 'Health-facility_Level', {
    message:
      'Health Facility is required when cadre Type is "Health-facility_Level".',
  })
  healthFacilityId: (Types.ObjectId | string)[];

  @ApiProperty({
    description: 'isAllHealthFacility',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isAllHealthFacility: boolean;

  @ApiProperty({
    description: 'Cadre ID',
    type: [String],
    example: ['66692c641d13656cdf9de2e3', '66692c641d13656cdf9de290'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  cadreId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'isAllCadre', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Assessment Type', example: 'real_time' })
  @IsNotEmpty()
  @IsString()
  assessmentType: string;

  @ApiProperty({ description: 'From Date of Assessment', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @DependentQuestion('assessmentType', 'Planned', {
    message: 'fromDate is required when assessment type is "Planned".',
  })
  fromDate: Date;

  @ApiProperty({ description: 'To Date of Assessment', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @DependentQuestion('assessmentType', 'Planned', {
    message: 'toDate is required when assessment type is "Planned".',
  })
  toDate: Date;

  @ApiProperty({ description: 'Initial Invitation Status', example: true })
  @IsOptional()
  @IsBoolean()
  initialInvitation: boolean = false;

  @ApiProperty({
    description: 'Created By (Admin User ID)',
    example: '614c1b2f1c9d440000cd2f32',
  })
  @IsOptional()
  @IsMongoId()
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Certificate Type', example: 1 })
  @IsNotEmpty()
  @IsMongoId()
  certificateType: Types.ObjectId;

  @ApiProperty({
    description: 'Questions of Assessment',
    type: [String],
    example: ['66eaccfd12653d310f064cc7'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  questions: Types.ObjectId[];

  @ApiProperty({
    description: 'Questions of Assessment',
    type: [Object],
    example: [
      {
        question: 'what is tuberculosis',
        option1: 'abc',
        option2: 'xyz',
        option3: 'pqr',
        option4: 'right',
        correctAnswer: 'option4',
        category: 'abc',
        explanation: 'description',
        isVisible: false,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentQuestionDto)
  newQuestions: AssessmentQuestionDto[];

  @ApiProperty({ description: 'Active Status', example: true })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @OneOfTwoFields('questions', 'newQuestions', {
    message:
      'Questions: Either Questions Bank Questions or New Question must be provided.',
  })
  validationField: string;
}
