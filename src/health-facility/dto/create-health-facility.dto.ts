import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateHealthFacilityDto {
  @ApiProperty({ description: 'Country id' })
  @IsMongoId()
  @IsNotEmpty()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'state id' })
  @IsMongoId()
  @IsNotEmpty()
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'district id' })
  @IsMongoId()
  @IsNotEmpty()
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'block id' })
  @IsMongoId()
  @IsNotEmpty()
  blockId: Types.ObjectId;

  @ApiProperty({ description: 'Health Facility id' })
  @IsString()
  @Unique('health-facility', 'healthFacilityCode', {
    message: 'healthFacilityCode must be unique',
  })
  healthFacilityCode: string;

  @ApiProperty({ description: 'DMC value' })
  @IsBoolean()
  DMC: boolean;

  @ApiProperty({ description: 'TRUNAT value' })
  @IsBoolean()
  TRUNAT: boolean;

  @ApiProperty({ description: 'CBNAAT value' })
  @IsBoolean()
  CBNAAT: boolean;

  @ApiProperty({ description: 'XRAY value' })
  @IsBoolean()
  XRAY: boolean;

  @ApiProperty({ description: 'ICTC value' })
  @IsBoolean()
  ICTC: boolean;

  @ApiProperty({ description: 'LPALAB id' })
  @IsBoolean()
  LPALab: boolean;

  @ApiProperty({ description: 'CONFIRMATION CENTER VALUE' })
  @IsBoolean()
  CONFIRMATIONCENTER: boolean;

  @ApiProperty({ description: 'Tobacco Cessation Clinic value' })
  @IsBoolean()
  TobaccoCessationClinic: boolean;

  @ApiProperty({ description: 'ANC Clinic Value' })
  @IsBoolean()
  ANCClinic: boolean;

  @ApiProperty({ description: 'Nutritional Rehabilitation Center value' })
  @IsBoolean()
  NutritionalRehabilitationCentre: boolean;

  @ApiProperty({ description: 'Addication Center value' })
  @IsBoolean()
  DeAddictionCentres: boolean;

  @ApiProperty({ description: 'ART centre value' })
  @IsBoolean()
  ARTCentre: boolean;

  @ApiProperty({ description: 'District DRTB center value' })
  @IsBoolean()
  DistrictDRTBCentre: boolean;

  @ApiProperty({ description: 'NODAL TB CENTER value' })
  @IsBoolean()
  NODALDRTBCENTER: boolean;

  @ApiProperty({ description: 'IRL value' })
  @IsBoolean()
  IRL: boolean;

  @ApiProperty({ description: 'PEDIATRIC CARE FACILITY value' })
  @IsBoolean()
  PediatricCareFacility: boolean;

  @ApiProperty({ description: 'LONGITUDE value' })
  @IsString()
  longitude: string;

  @ApiProperty({ description: 'LATITUDE value' })
  @IsString()
  latitude: string;

  @ApiProperty({ description: 'Id of Mysql' })
  @IsNumber()
  id: number;
}
