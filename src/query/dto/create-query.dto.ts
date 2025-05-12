import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  TRANSGENDER = 'Transgender',
}
export class CreateQueryDto {
  @ApiProperty({ description: 'Query Subscriber Age Details' })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({ description: 'Query Subscriber Sex Details' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(Gender, {
    message: 'Gender must be one of the following: Male, Female, Transgender',
  })
  sex: Gender;

  @ApiProperty({ description: 'Query Subscriber Diagnosis Details' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({
    description: 'Query Subscriber Date of Admission Details',
    type: String, // Indicate that this is a string in the generated Swagger doc
    example: '2024-09-20',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfAdmission: Date;

  @ApiProperty({
    description: 'Query Subscriber Chief complaint Details',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  chiefComplaint?: string;

  @ApiProperty({
    description:
      'Query Subscriber History of present illness & duration (In case of ADR or CDST, Comorbidities Please mention here Details',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  illness?: string;

  @ApiProperty({
    description: 'Query Subscriber Past History/Follow Up History Details',
    required: false,
  })
  @IsOptional()
  @IsString()
  pastHistory?: string;

  @ApiProperty({
    description:
      'Query Subscriber Pre Treatment Evaluation findings (Current episode) Details',
    required: false,
  })
  @IsOptional()
  @IsString()
  preTreatmentEvaluation?: string;

  @ApiProperty({
    description:
      'Query Subscriber Assessment and Differential Diagnosis Details',
    required: false,
  })
  @IsOptional()
  @IsString()
  assessmentAndDiffDiagnosis?: string;

  @ApiProperty({
    description: 'Current Treatment Plan (Regimen) Details',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  currentTreatmentPlan?: string;

  @ApiProperty({ description: 'Query Details' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ description: 'Query id Details' })
  @IsOptional()
  @IsString()
  queryId: string;

  @ApiProperty({ description: 'Response of Query', required: false })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiProperty({ description: 'Query raised by Subscriber of DRTB' })
  @IsMongoId()
  raisedBy: Types.ObjectId;

  @ApiProperty({
    description: 'Query responded by Subscriber name',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  respondedBy?: Types.ObjectId;

  @ApiProperty({ description: 'Query Raised Role of Subscriber' })
  @IsMongoId()
  queryRaisedRole: Types.ObjectId;

  @ApiProperty({
    description: 'Query Responded Role of Subscriber',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  queryRespondedRole?: Types.ObjectId;

  @ApiProperty({ description: 'Query Raised Institute' })
  @IsMongoId()
  queryRaisedInstitute: Types.ObjectId;

  @ApiProperty({ description: 'Query Responded Institute', required: false })
  @IsOptional()
  @IsMongoId()
  queryRespondedInstitute?: Types.ObjectId;

  @ApiProperty({ description: 'Status of Query', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'History of Queries', required: false })
  @IsOptional()
  @IsArray()
  payload?: object[];
}
