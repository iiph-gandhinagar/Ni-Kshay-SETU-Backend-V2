import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'The name of the Country',
    example: 'India',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Unique('country', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({
    description: 'The Id of the Country',
    example: 'India',
  })
  @IsOptional()
  @IsNumber()
  id: number;
}
