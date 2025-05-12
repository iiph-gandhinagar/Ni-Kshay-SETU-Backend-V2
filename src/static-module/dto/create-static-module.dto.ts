import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStaticModuleDto {
  @ApiProperty({ description: 'Title of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Description of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  description: object;

  @ApiProperty({ description: 'Icon of the Key Features' })
  @IsNotEmpty()
  @IsString({ each: true })
  image: string[];

  @ApiProperty({ description: 'Slug of the Key Features' })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({ description: 'orderIndex of the Key Features' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for key Features' })
  @IsBoolean()
  active: boolean;
}
