import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

class Title {
  @ApiProperty({ description: 'Title in English', example: 'English Title' })
  @IsNotEmpty()
  @IsString()
  en: string;

  @ApiProperty({ description: 'Title in Hindi', example: 'Hindi Title' })
  @IsOptional()
  @IsString()
  hi: string;

  @ApiProperty({ description: 'Title in Gujarati', example: 'Gujarati Title' })
  @IsOptional()
  @IsString()
  gu: string;
}
export class CreateStaticFaqDto {
  @ApiProperty({ description: 'Question of the FAQ' })
  @IsNotEmpty()
  @Unique('static-faq', 'question', { message: 'question must be unique' })
  @ValidateNested()
  @Type(() => Title)
  question: Title;

  @ApiProperty({ description: 'Description of the FAQ' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Title)
  description: Title;

  @ApiProperty({ description: 'order Index of the FAQ' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active status of the FAQ' })
  active: boolean;
}
