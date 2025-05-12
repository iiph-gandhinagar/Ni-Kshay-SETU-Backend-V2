import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Diagnosis of the user prescription' })
  @IsNotEmpty({ message: 'Diagnosis is required' })
  @IsString({ message: 'Diagnosis must be a string' })
  diagnosis: string;

  @ApiProperty({ description: 'Regimen of the user prescription' })
  @IsNotEmpty({ message: 'Regimen is required' })
  @IsString({ message: 'Regimen must be a string' })
  regimen: string;

  @ApiProperty({ description: 'Prescription of the user prescription' })
  @IsNotEmpty({ message: 'Prescription is required' })
  @IsString({ message: 'Prescription must be a string' })
  prescription: string;

  @ApiProperty({ description: 'Notes of the user prescription' })
  @IsNotEmpty({ message: 'Notes are required' })
  @IsString({ message: 'Notes must be a string' })
  notes: string;
}
