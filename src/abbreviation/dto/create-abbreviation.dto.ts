import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateAbbreviationDto {
  @ApiProperty({ description: 'Title of the Abbreviation' })
  @IsNotEmpty()
  @IsString()
  @Unique('abbreviation', 'title', { message: 'Title must be unique' })
  title: string;

  @ApiProperty({ description: 'Patterns of the Abbreviation' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  patterns: string[];
}
