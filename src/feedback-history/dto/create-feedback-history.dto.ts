import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RatingDto {
  @ApiProperty({ description: 'The ID of the feedback item', example: 4 })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'The rating value', example: 4 })
  @IsNotEmpty()
  @IsInt()
  rating: number;

  @ApiProperty({ description: 'Indicates if the item was skipped', example: 0 })
  @IsNotEmpty()
  @IsBoolean()
  skip: boolean;
}

export class CreateFeedbackHistoryDto {
  @ApiProperty({
    description: 'Array of rating objects',
    type: [RatingDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  ratings: RatingDto[];

  @ApiProperty({
    description: 'Optional review provided by the user',
    example: 'User Friendly App UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  review?: string;
}
