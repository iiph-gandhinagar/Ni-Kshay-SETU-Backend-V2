import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateCadreDto {
  @ApiProperty({ description: 'Title Of cadre' })
  @IsNotEmpty()
  @IsString()
  @Unique('cadre', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Cadre Group of Cadre' })
  @IsNotEmpty()
  @IsMongoId()
  cadreGroup: Types.ObjectId;

  @ApiProperty({ description: 'Cadre Type' })
  @IsNotEmpty()
  @IsString()
  cadreType: string;
}
