import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateQuestionBankDto {
  @ApiProperty({ description: 'Language of Question' })
  @IsNotEmpty({ message: 'Language is required' })
  @IsString({ message: 'Language must be a string' })
  language: string;

  @ApiProperty({ description: 'Questions Details' })
  @IsNotEmpty({ message: 'Question is required' })
  @IsString({ message: 'Question must be a string' })
  @Unique('question-bank', 'question', { message: 'Question must be unique' })
  question: string;

  @ApiProperty({ description: 'Option 1' })
  @IsNotEmpty({ message: 'Option 1 is required' })
  @IsString({ message: 'Option 1 must be a string' })
  option1: string;

  @ApiProperty({ description: 'Option 2' })
  @IsNotEmpty({ message: 'Option 2 is required' })
  @IsString({ message: 'Option 2 must be a string' })
  option2: string;

  @ApiProperty({ description: 'Option 3' })
  @IsOptional()
  @IsString({ message: 'Option 3 must be a string' })
  option3: string;

  @ApiProperty({ description: 'Option 4' })
  @IsOptional()
  @IsString({ message: 'Option 4 must be a string' })
  option4: string;

  @ApiProperty({ description: 'Correct Answer' })
  @IsNotEmpty({ message: 'Correct answer is required' })
  @IsString({ message: 'Correct answer must be a string' })
  correctAnswer: string;

  @ApiProperty({ description: 'Category' })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category: string;

  @ApiProperty({ description: 'explanation' })
  @IsOptional()
  @IsString({ message: 'explanation must be a String' })
  explanation: string;

  @ApiProperty({ description: 'Question Level (Easy,Moderate,difficult)' })
  @IsOptional()
  @IsString({ message: 'explanation must be a string' })
  qLevel: string;

  @ApiProperty({ description: 'cadre Type' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadres' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreId: Types.ObjectId;

  @ApiProperty({ description: 'isAllCadre', type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;
}
