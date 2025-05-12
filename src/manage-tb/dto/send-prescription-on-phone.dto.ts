import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

class PerceptionDetails {
  @ApiProperty({ description: 'User Name', example: 'Regimen' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Diagnosis Name', example: 'TB and Nutrition' })
  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @ApiProperty({ description: 'Regimen Name', example: 'Regimen' })
  @IsNotEmpty()
  @IsString()
  regimen: string;

  @ApiProperty({
    description: 'Prescription Details',
    example: 'Prescription',
  })
  @IsNotEmpty()
  @IsString()
  prescription: string;

  @ApiProperty({ description: 'Notes', example: 'Regimen' })
  @IsNotEmpty()
  @IsString()
  notes: string;
}

export class SendPrescriptionOnPhone {
  @ApiProperty({ description: 'Prescription Details' })
  @IsNotEmpty()
  @IsObject()
  @Type(() => PerceptionDetails)
  prescription: PerceptionDetails;
}
