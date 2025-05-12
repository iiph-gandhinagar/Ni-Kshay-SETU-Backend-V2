import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateStaticWhatWeDoDto {
  @ApiProperty({ description: 'Title of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Location of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  location: string;

  @ApiProperty({ description: 'Cover Image of the Key Features' })
  @IsNotEmpty()
  @IsString({ each: true })
  coverImage: string[];

  @ApiProperty({ description: 'orderIndex of the Key Features' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for key Features' })
  @IsBoolean()
  active: boolean;
}
