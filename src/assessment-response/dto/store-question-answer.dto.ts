import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class answer {
  @ApiProperty({ description: 'Question of the message' })
  @IsNotEmpty()
  @IsMongoId()
  questionId: Types.ObjectId;

  @ApiProperty({ description: 'answer of the question' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Is active status ' })
  @IsNotEmpty()
  @IsBoolean()
  isSubmit: boolean;

  @ApiProperty({ description: 'Is Correct status ' })
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ description: 'Correct Answer ' })
  @IsNotEmpty()
  @IsString()
  selectedOption: string;
}

export class StoreQuestionAnswerDto {
  @ApiProperty({ description: 'Assessment Id' })
  @IsNotEmpty()
  @IsMongoId()
  assessmentId: Types.ObjectId;

  @ApiProperty({ description: 'Answer Object' })
  @IsObject()
  @IsNotEmpty()
  answer: answer;
}
