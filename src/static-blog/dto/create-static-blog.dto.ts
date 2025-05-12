import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
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

export class CreateStaticBlogDto {
  @ApiProperty({ description: 'Title of the Blog' })
  @IsNotEmpty()
  @IsObject()
  @Unique('static-blog', 'title', { message: 'title must be unique' })
  @ValidateNested()
  @Type(() => Title)
  title: Title;

  @ApiProperty({ description: 'Slug of the Blog' })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Short Description of the Blog' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Title)
  shortDescription: Title;

  @ApiProperty({ description: 'Description of the Blog' })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Title)
  description: Title;

  @ApiProperty({ description: 'order Index of the Blog' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Source of the Blog' })
  @IsOptional()
  @IsString()
  source: string;

  @ApiProperty({ description: 'Author of the Blog' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({ description: 'image1 of the Blog' })
  @IsNotEmpty()
  @IsString()
  image1: string;

  @ApiProperty({ description: 'image2 of the Blog' })
  @IsOptional()
  @IsString()
  image2: string;

  @ApiProperty({ description: 'image3 of the Blog' })
  @IsOptional()
  @IsString()
  image3: string;

  @ApiProperty({ description: 'Active status of the Blog' })
  active: boolean;

  @ApiProperty({ description: 'Keywords of the Blog' })
  @IsNotEmpty()
  @IsArray()
  keywords: string[];
}
