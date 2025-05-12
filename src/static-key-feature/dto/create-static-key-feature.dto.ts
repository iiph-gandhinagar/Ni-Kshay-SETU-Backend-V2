import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateStaticKeyFeatureDto {
  @ApiProperty({ description: 'Title of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  @Unique('static-key-feature', 'title', { message: 'title must be unique' })
  title: object;

  @ApiProperty({ description: 'Description of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  description: object;

  @ApiProperty({ description: 'Icon of the Key Features' })
  @IsNotEmpty()
  @IsString({ each: true })
  icon: string[];

  @ApiProperty({ description: 'Background Icon of the Key Features' })
  @IsNotEmpty()
  @IsString({ each: true })
  backgroundIcon: string[];

  @ApiProperty({ description: 'orderIndex of the Key Features' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for key Features' })
  @IsBoolean()
  active: boolean;
}
