import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateStaticReleaseDto {
  @ApiProperty({ description: 'Feature of the Release' })
  @ValidateIf((o) => o.bugFix == null && o.bugFix === '')
  @IsArray()
  @IsObject()
  feature: object[];

  @ApiProperty({ description: 'Bug Fix of the Release' })
  @ValidateIf((o) => o.feature == null && o.feature === '')
  @IsArray()
  @IsObject()
  bugFix: object[];

  @ApiProperty({ description: 'Date of the Release' })
  @IsNotEmpty()
  @IsString()
  date: Date;

  @ApiProperty({ description: 'orderIndex of the Release' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for Release' })
  @IsBoolean()
  active: boolean;
}
