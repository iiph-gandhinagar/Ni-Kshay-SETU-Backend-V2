import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateLeaderBoardLevelDto {
  @ApiProperty({ example: 'Gold', description: 'Level name' })
  @IsNotEmpty()
  @IsString()
  level: string;

  @ApiProperty({
    example: 'Achieved by top 10%',
    description: 'Description of the level',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateLeaderBoardLevelDto {
  @ApiProperty({
    example: 'Platinum',
    description: 'Updated level name',
    required: false,
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({
    example: 'Achieved by top 5%',
    description: 'Updated description',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}

export class CreateBadgeDto {
  @ApiProperty({ example: 'Achiever', description: 'Name of the badge' })
  @IsString()
  @IsNotEmpty()
  badge: string;

  @ApiProperty({
    example: '64f8c9f3f4d4b2a35cfb73df',
    description: 'Level ID associated with the badge',
  })
  @IsMongoId() // Validate that it is a valid MongoDB ObjectId
  levelId: Types.ObjectId;

  @ApiProperty({ example: '1', description: 'Index of Badge' })
  @IsNumber()
  @IsNotEmpty()
  index: number;
}
export class UpdateBadgeDto {
  @ApiProperty({ example: 'Achiever', description: 'Name of the badge' })
  @IsString()
  @IsOptional()
  badge: string;

  @ApiProperty({
    example: '64f8c9f3f4d4b2a35cfb73df',
    description: 'Level ID associated with the badge',
  })
  @IsOptional()
  @IsMongoId() // Validate that it is a valid MongoDB ObjectId
  levelId: Types.ObjectId;

  @ApiProperty({ example: '1', description: 'Index of Badge' })
  @IsNumber()
  @IsOptional()
  index: number;
}
export class CreateTaskDto {
  @ApiProperty({ example: '64f8c9f3f4d4b2a35cfb73df', description: 'Level ID' })
  @IsMongoId() // Validate that it is a valid MongoDB ObjectId
  levelId: Types.ObjectId;

  @ApiProperty({ example: '64f9b9f8f3f4b2a35cfb73de', description: 'Badge ID' })
  @IsMongoId()
  badgeId: Types.ObjectId;

  @ApiProperty({ example: 300, description: 'Minimum time spent' })
  @IsNumber()
  minSpent: number;

  @ApiProperty({ example: 5, description: 'Sub-module usage count' })
  @IsNumber()
  subModuleUsageCount: number;

  @ApiProperty({ example: 25, description: 'Sub-module chatbot usage count' })
  @IsNumber()
  chatbotUsageCount: number;

  @IsOptional()
  @IsNumber()
  kbaseCompletion: number;

  @ApiProperty({
    example: 5,
    description: 'Sub-module app opened count usage count',
  })
  @IsNumber()
  appOpenedCount: number;

  @ApiProperty({
    example: 5,
    description: 'correctness of answers',
  })
  @IsNumber()
  correctnessOfAnswers: number;

  @ApiProperty({
    example: 5,
    description: 'total Assessments',
  })
  @IsNumber()
  totalAssessments: number;
}

export class UpdateTaskDto {
  @ApiProperty({
    example: '64f8c9f3f4d4b2a35cfb73df',
    description: 'Level ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId() // Validate that it is a valid MongoDB ObjectId
  levelId: Types.ObjectId;

  @ApiProperty({
    example: '64f9b9f8f3f4b2a35cfb73de',
    description: 'Badge ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  badgeId: Types.ObjectId;

  @ApiProperty({
    example: 300,
    description: 'Minimum time spent',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minSpent: number;

  @ApiProperty({
    example: 5,
    description: 'Sub-module usage count',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  subModuleUsageCount: number;

  @ApiProperty({
    example: 25,
    description: 'Sub-module chatbot usage count',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  chatbotUsageCount: number;

  @ApiProperty({
    example: 10,
    description: 'App opened count',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  appOpenedCount: number;

  @IsOptional()
  @IsNumber()
  kbaseCompletion: number;

  @ApiProperty({
    example: 5,
    description: 'correctness of answers',
  })
  @IsNumber()
  correctnessOfAnswers: number;

  @ApiProperty({
    example: 5,
    description: 'total Assessments',
  })
  @IsNumber()
  totalAssessments: number;
}
