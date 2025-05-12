import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAssessmentResponseDto {
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
  skip: number;

  @ApiProperty({ description: 'Is Marks Calculated', default: false })
  @IsBoolean()
  @IsOptional()
  isCalculated?: boolean;
}
