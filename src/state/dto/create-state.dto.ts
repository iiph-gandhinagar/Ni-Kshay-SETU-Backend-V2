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

export class CreateStateDto {
  @ApiProperty({ description: 'Title Of state' })
  @IsNotEmpty()
  @IsString()
  // @Transform(({ value }) => value?.trim())
  @Unique('state', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Country id' })
  @IsNotEmpty()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'Id of mysql' })
  @IsOptional()
  @IsNumber()
  id: number;
}
