import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFlashNewDto {
  @ApiProperty({ description: 'Title of the Flash News' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the Flash News',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Image of the Flash News',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Author of the Flash News Content',
    required: false,
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: 'Source of the Flash News Content' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Href of the Flash News Content',
    required: false,
  })
  @IsString()
  @IsOptional()
  href?: string;

  @ApiProperty({
    description: 'Publish Date of the Flash News Content',
    required: false,
  })
  @IsDate()
  @IsOptional()
  publishDate?: Date;

  @ApiProperty({
    description: 'Order Index of the Flash News Content',
    required: false,
  })
  @IsNumber()
  orderIndex: number;

  @ApiProperty({
    description: 'Active Status of the Flash News Content',
    default: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean = true;
}
