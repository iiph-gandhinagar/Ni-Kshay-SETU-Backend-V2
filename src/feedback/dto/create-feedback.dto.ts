import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Question of Feedback' })
  @IsNotEmpty()
  @IsObject()
  question: object;

  @ApiProperty({ description: 'Description of Feedback' })
  @IsOptional()
  @IsObject()
  description: object;

  @ApiProperty({ description: 'Feedback Value of Feedback' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1) // Assuming feedbackValue should have a minimum value of 1
  feedbackValue: number;

  @ApiProperty({ description: 'Feedback time of Feedback' })
  @IsOptional()
  @IsNumber()
  feedbackTime: number;

  @ApiProperty({ description: 'Feedback type of Feedback' })
  @IsNotEmpty()
  @IsString()
  feedbackType: string;

  @ApiProperty({ description: 'Feedback Days of Feedback' })
  @IsOptional()
  @IsNumber()
  feedbackDays: number;

  @ApiProperty({ description: 'Feedback Icon of Feedback' })
  @IsNotEmpty()
  @IsString()
  feedbackIcon: string;

  @ApiProperty({ description: 'Active Status of Feedback' })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
