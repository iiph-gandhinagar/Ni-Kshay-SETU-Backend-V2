import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class DescriptionDto {
  @IsString()
  @IsNotEmpty()
  en: string; // English description

  @IsOptional()
  @IsString()
  hi?: string; // Optional Hindi description

  @IsOptional()
  @IsString()
  gu?: string; // Optional Gujarati description
}
export class CreateMasterCmDto {
  @ApiProperty({ description: 'Title of master CMS' })
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty' })
  @Unique('master-cms', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Description of master CMS' })
  @ValidateNested()
  @Type(() => DescriptionDto)
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: DescriptionDto;
}
