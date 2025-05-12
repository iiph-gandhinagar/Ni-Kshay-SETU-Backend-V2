import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { CreateSymptomDto } from './create-symptom.dto';

export class UpdateSymptomDto extends PartialType(CreateSymptomDto) {
  @ApiProperty({ description: 'Title Of Symptom' })
  @IsOptional()
  @IsObject()
  title?: object;
}
