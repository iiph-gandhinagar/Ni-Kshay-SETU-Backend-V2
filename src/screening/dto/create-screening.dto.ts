import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateScreeningDto {
  @ApiProperty({ description: 'User of the Screening Tool' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Age of the Screening Tool' })
  @IsNumber()
  age: number;

  @ApiProperty({ description: 'Weight of the Screening Tool' })
  @IsNumber()
  weight: number;

  @ApiProperty({ description: 'Height of the Screening Tool' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'Symptoms Selected of the Screening Tool' })
  @IsArray()
  @IsString({ each: true })
  symptomSelected: string[];

  @ApiProperty({ description: 'Symptoms Name of the Screening Tool' })
  @IsString()
  @IsOptional()
  symptomName?: string;

  @ApiProperty({ description: 'Tb flag of the Screening Tool' })
  @IsBoolean()
  @IsOptional()
  isTb?: boolean;
}
