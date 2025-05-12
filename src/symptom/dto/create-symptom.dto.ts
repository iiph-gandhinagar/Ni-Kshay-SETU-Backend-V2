import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateSymptomDto {
  @ApiProperty({ description: 'Title Of Symptom' })
  @IsNotEmpty()
  @IsObject()
  @Unique('symptom', 'title', { message: 'title must be unique' })
  title: object;

  @ApiProperty({ description: 'Category of Symptoms' })
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Icon of the Symptom' })
  @IsString()
  @IsNotEmpty()
  icon: string;
}
