import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DependentQuestion } from 'src/common/decorators/dependentQuestion.decorator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateSystemQuestionDto {
  @ApiProperty({ description: 'Category of the System Question Tool' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Title of the System Question Tool' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ description: 'Questions of the System Question Tool' })
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  @DependentQuestion('category', 'System-tools', {
    message: 'questions is required when category is "System-tools".',
  })
  @Unique('system-question', 'question', { message: 'question must be unique' })
  questions: object[];

  @ApiProperty({ description: 'Answers of the System Question Tool' })
  @IsArray()
  @IsObject({ each: true })
  @DependentQuestion('category', 'System-tools', {
    message: 'answers is required when category is "System-tools".',
  })
  @IsOptional()
  answers: object[];

  @ApiProperty({ description: 'NTEP Id of the System Question Tool' })
  @IsNumber()
  @IsOptional()
  @DependentQuestion('category', 'NTEP', {
    message: 'NTEPId is required when category is "NTEP".',
  })
  @Unique('system-question', 'NTEPId', { message: 'NTEPId must be unique' })
  NTEPId: number;

  @ApiProperty({ description: 'Active Status of the System Question Tool' })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
