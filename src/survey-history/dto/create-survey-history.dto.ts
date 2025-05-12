import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class QuestionAnswerDto {
  @ApiProperty({ description: 'Survey Question Id' })
  @IsNotEmpty()
  @IsString()
  surveyQuestionId: string;

  @ApiProperty({ description: 'Answer of the Survey Question' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class CreateSurveyHistoryDto {
  @ApiProperty({ description: 'User Id of Survey History' })
  @IsOptional()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Survey Id of Survey History' })
  @IsNotEmpty()
  @IsMongoId()
  surveyId: Types.ObjectId;

  @ApiProperty({ description: 'Question Answer Details of Survey History' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  questionAnswer: QuestionAnswerDto[];
}
