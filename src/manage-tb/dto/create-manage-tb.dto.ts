import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  TRANSGENDER = 'Transgender',
}

export class CreateManageTbDto {
  @ApiProperty({ description: 'Age Number' })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Age must be at least $constraint1' })
  @Max(100, { message: 'Age must not exceed $constraint1' })
  age: number;

  @ApiProperty({ description: 'Weight Number' })
  @IsNotEmpty()
  @IsInt()
  @Min(4, { message: 'Weight must be at least $constraint1' })
  @Max(150, { message: 'Weight must not exceed $constraint1' })
  weight: number;

  @ApiProperty({ description: 'Weight Number' })
  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gender must be one of the following: Male, Female, Transgender',
  })
  sex: Gender;

  @ApiProperty({ description: 'Site of Disease' })
  @IsNotEmpty()
  @IsString()
  site_of_disease: string;

  @ApiProperty({ description: 'Chest x ray' })
  @IsOptional()
  @IsString()
  chest_x_ray: string;

  @ApiProperty({ description: 'Sputum Afb' })
  @IsNotEmpty()
  @IsString()
  sputum_afb: string;

  @ApiProperty({ description: 'CBNAAT/TruNAT' })
  @IsNotEmpty()
  @IsString()
  cbnaat_trunat: string;

  @ApiProperty({ description: 'FL-LPA Result' })
  @IsNotEmpty()
  @IsString()
  fl_lpa_result: string;

  @ApiProperty({ description: 'SL-LPA Result' })
  @IsNotEmpty()
  @IsString()
  sl_lpa_result: string;

  @ApiProperty({ description: 'MGIT & DST Result' })
  @IsNotEmpty()
  @IsString()
  mgit_dst_result: string;

  @ApiProperty({ description: 'pregnancy status' })
  @IsOptional()
  @IsString()
  pregnancy_status: string;

  @ApiProperty({ description: 'MTB' })
  @IsOptional()
  @IsString()
  mtb: string;

  @ApiProperty({ description: 'rifampicin_resistance_2' })
  @IsOptional()
  @IsString()
  rifampicin_resistance_2: string;

  @ApiProperty({ description: 'rifampicin_resistance_1' })
  @IsOptional()
  @IsString()
  rifampicin_resistance_1: string;

  @ApiProperty({ description: 'inh_a_low' })
  @IsOptional()
  @IsString()
  inh_a_low: string;

  @ApiProperty({ description: 'katg_high' })
  @IsOptional()
  @IsString()
  katg_high: string;

  @ApiProperty({ description: 'fq' })
  @IsOptional()
  @IsString()
  fq: string;

  @ApiProperty({ description: 'can_high_dose_moxifloxacin_mfxh_be_given' })
  @IsOptional()
  @IsString()
  can_high_dose_moxifloxacin_mfxh_be_given: string;

  @ApiProperty({ description: 'second_line_injectables' })
  @IsOptional()
  @IsString()
  second_line_injectables: string;

  @ApiProperty({ description: 'bedaquiline_bdq' })
  @IsOptional()
  @IsString()
  bedaquiline_bdq: string;

  @ApiProperty({ description: 'levofloxacin_lfx' })
  @IsOptional()
  @IsString()
  levofloxacin_lfx: string;

  @ApiProperty({ description: 'moxifloxacin_high_dose_mfxh' })
  @IsOptional()
  @IsString()
  moxifloxacin_high_dose_mfxh: string;

  @ApiProperty({ description: 'linezolid_lzd' })
  @IsOptional()
  @IsString()
  linezolid_lzd: string;

  @ApiProperty({ description: 'clofazimine_cfz' })
  @IsOptional()
  @IsString()
  clofazimine_cfz: string;

  @ApiProperty({ description: 'delamanid_dlm' })
  @IsOptional()
  @IsString()
  delamanid_dlm: string;

  @ApiProperty({ description: 'kanamycin_km' })
  @IsOptional()
  @IsString()
  kanamycin_km: string;

  @ApiProperty({ description: 'amikacin_am' })
  @IsOptional()
  @IsString()
  amikacin_am: string;

  @ApiProperty({ description: 'pyrazinamide_z' })
  @IsOptional()
  @IsString()
  pyrazinamide_z: string;

  @ApiProperty({ description: 'ethionamide_eto' })
  @IsOptional()
  @IsString()
  ethionamide_eto: string;

  @ApiProperty({ description: 'p_aminosalycyclic_acid_pas' })
  @IsOptional()
  @IsString()
  p_aminosalycyclic_acid_pas: string;

  @ApiProperty({ description: 'hiv' })
  @IsOptional()
  @IsString()
  hiv: string;

  @ApiProperty({ description: 'suffering_from_any_chronic_illness' })
  @IsOptional()
  @IsString()
  suffering_from_any_chronic_illness: string;

  @ApiProperty({ description: 'seizure_disorder' })
  @IsOptional()
  @IsString()
  seizure_disorder: string;

  @ApiProperty({ description: 'chronic_kidney_disease' })
  @IsOptional()
  @IsString()
  chronic_kidney_disease: string;

  @ApiProperty({ description: 'chronic_liver_disease' })
  @IsOptional()
  @IsString()
  chronic_liver_disease: string;

  @ApiProperty({ description: 'depression' })
  @IsOptional()
  @IsString()
  depression: string;

  @ApiProperty({ description: 'cardiac_disease' })
  @IsOptional()
  @IsString()
  cardiac_disease: string;

  @ApiProperty({ description: 'diabetes' })
  @IsOptional()
  @IsString()
  diabetes: string;
}
