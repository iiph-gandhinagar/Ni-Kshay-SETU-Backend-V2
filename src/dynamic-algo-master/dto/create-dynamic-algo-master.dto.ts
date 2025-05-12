import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateDynamicAlgoMasterDto {
  @ApiProperty({
    description: 'Title of dynamic algorithm',
    example: 'Algorithm Title',
  })
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Icon of the Diagnosis Algorithm' })
  @IsOptional()
  @IsString()
  icon: string;

  @ApiProperty({ description: 'Status of dynamic algorithm', default: false })
  @IsBoolean()
  active: boolean;
}
