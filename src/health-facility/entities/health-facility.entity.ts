import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type HealthFacilityDocument = HealthFacility & Document;

@Schema({ timestamps: true })
export class HealthFacility {
  @ApiProperty({ description: 'country id' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id' })
  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'District Id' })
  @Prop({ type: Types.ObjectId, ref: 'District', required: true })
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Block Id' })
  @Prop({ type: Types.ObjectId, ref: 'Block', required: true })
  blockId: Types.ObjectId;

  @ApiProperty({ description: 'Health Facility Code' })
  @Prop({ type: Object, required: true })
  healthFacilityCode: string;

  @ApiProperty({ description: 'DMC value' })
  @Prop({ default: false })
  DMC: boolean;

  @ApiProperty({ description: 'TRUNAT value' })
  @Prop({ default: false })
  TRUNAT: boolean;

  @ApiProperty({ description: 'CBNAAT value' })
  @Prop({ default: false })
  CBNAAT: boolean;

  @ApiProperty({ description: 'XRAY value' })
  @Prop({ default: false })
  XRAY: boolean;

  @ApiProperty({ description: 'ICTC value' })
  @Prop({ default: false })
  ICTC: boolean;

  @ApiProperty({ description: 'LPALAB id' })
  @Prop({ default: false })
  LPALab: boolean;

  @ApiProperty({ description: 'CONFIRMATION CENTER VALUE' })
  @Prop({ default: false })
  CONFIRMATIONCENTER: boolean;

  @ApiProperty({ description: 'Tobacco Cessation Clinic value' })
  @Prop({ default: false })
  TobaccoCessationClinic: boolean;

  @ApiProperty({ description: 'ANC Clinic Value' })
  @Prop({ default: false })
  ANCClinic: boolean;

  @ApiProperty({ description: 'Nutritional Rehabilitation Center value' })
  @Prop({ default: false })
  NutritionalRehabilitationCentre: boolean;

  @ApiProperty({ description: 'Addication Center value' })
  @Prop({ default: false })
  DeAddictionCentres: boolean;

  @ApiProperty({ description: 'ART centre value' })
  @Prop({ default: false })
  ARTCentre: boolean;

  @ApiProperty({ description: 'District DRTB center value' })
  @Prop({ default: false })
  DistrictDRTBCentre: boolean;

  @ApiProperty({ description: 'NODAL TB CENTER value' })
  @Prop({ default: false })
  NODALDRTBCENTER: boolean;

  @ApiProperty({ description: 'IRL value' })
  @Prop({ default: false })
  IRL: boolean;

  @ApiProperty({ description: 'PEDIATRIC CARE FACILITY value' })
  @Prop({ default: false })
  PediatricCareFacility: boolean;

  @ApiProperty({ description: 'Longitude value' })
  @Prop({ type: String, required: false })
  longitude: string;

  @ApiProperty({ description: 'Latitude value' })
  @Prop({ type: String, required: false })
  latitude: string;

  @ApiProperty({ description: 'Id of Mysql' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const HealthFacilitySchema =
  SchemaFactory.createForClass(HealthFacility);
