import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreatePrimaryCadreDto {
  @ApiProperty({ description: 'Title of the Primary Cadre' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Unique('primary-cadre', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Audience Id of the Primary Cadre' })
  @IsNotEmpty()
  @IsString()
  audienceId: string;
}
