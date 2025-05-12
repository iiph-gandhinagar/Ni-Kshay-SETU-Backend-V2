import { Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

@Schema({ timestamps: true })
class TourSlideDto {
  @ApiProperty({ description: 'Title of the Tour Slide' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Short Description of the Tour Slide' })
  @IsNotEmpty()
  @IsObject()
  shortDescription: object;

  @ApiProperty({ description: 'Description of the Tour Slide' })
  @IsNotEmpty()
  @IsObject()
  description: object;

  @ApiProperty({ description: 'Icon of the Tour Slide' })
  @IsNotEmpty()
  @IsString()
  icon: string;

  @ApiProperty({ description: 'Color Gradient of the Tour Slide' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  colorGradient: string[];

  @ApiProperty({ description: 'Text Color of the Tour Slide' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  textColor: string[];

  @ApiProperty({ description: 'Order Index of the Tour Slide' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;
}

export class CreateTourDto {
  @ApiProperty({ description: 'Title of the Tour' })
  @IsObject()
  @IsNotEmpty()
  title: object;

  @ApiProperty({ description: 'Tour Slides of the Tour' })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TourSlideDto)
  tourSlides: TourSlideDto[];

  @ApiProperty({ description: 'Active status of the Tour', default: true })
  @IsBoolean()
  active: boolean = true;

  @ApiProperty({ description: 'Default status of the Tour', default: false })
  @IsBoolean()
  default: boolean = false;
}
