import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateBlockDto {
  @ApiProperty({ description: 'Title Of Block' })
  @IsNotEmpty()
  @IsString()
  @Unique('block', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Country id' })
  @IsNotEmpty()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id' })
  @IsNotEmpty()
  @IsMongoId()
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'District id' })
  @IsNotEmpty()
  @IsMongoId()
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Id of Mysql' })
  @IsOptional()
  @IsNumber()
  id: number;
}
