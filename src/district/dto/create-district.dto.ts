import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateDistrictDto {
  @ApiProperty({ description: 'Title Of District' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  // @Matches(/\S/, { message: 'Title should not contain only whitespace' })
  @Unique('district', 'title', { message: 'Title must be unique' })
  title: string;

  @ApiProperty({ description: 'Country id' })
  @IsNotEmpty()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id' })
  @IsNotEmpty()
  @IsMongoId()
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'Id of mysql' })
  @IsOptional()
  @IsNumber()
  id: number;
}
