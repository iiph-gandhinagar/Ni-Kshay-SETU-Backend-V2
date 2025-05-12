import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AssessmentDocument = Assessment & Document;

@Schema({ timestamps: true })
export class Assessment {
  @ApiProperty({ description: 'Title of Assessment' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Language of Assessment' })
  @Prop({ type: String, required: true })
  language: string;

  @ApiProperty({ description: 'Time To complete Assessment' })
  @Prop({ type: Number, required: true })
  timeToComplete: number;

  @ApiProperty({ description: 'Country Id of an Assessment' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: false })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State Id of an assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'State', required: false })
  stateId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'District Id of an assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'District', required: false })
  districtId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'All Flag Of District' })
  @Prop({ type: Boolean, default: false })
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Block Id of an Assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'Block', required: false })
  blockId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'All Flag Of Block' })
  @Prop({ type: Boolean, default: false })
  isAllBlock: boolean;

  @ApiProperty({ description: 'Health Facility id of an Assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'HealthFacility', required: false })
  healthFacilityId: (Types.ObjectId | string)[];

  @ApiProperty({ description: 'All Flag Of Health-Facility' })
  @Prop({ type: Boolean, default: false })
  isAllHealthFacility: boolean;

  @ApiProperty({ description: 'Cadre Id of an assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: true })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Cadre Type of' })
  @Prop({ type: [String], required: true })
  cadreType: [string];

  @ApiProperty({ description: 'Assessment Type (planned or real time)' })
  @Prop({ type: String, required: true })
  assessmentType: string;

  @ApiProperty({ description: 'From Date of a planned assessment' })
  @Prop({ type: Date, required: false })
  fromDate: Date;

  @ApiProperty({ description: 'To date of a planned assessment' })
  @Prop({ type: Date, required: false })
  toDate: Date;

  @ApiProperty({ description: 'Initial invitation of an assessment' })
  @Prop({ type: Boolean, required: true })
  initialInvitation: boolean;

  @ApiProperty({ description: 'Created Admin User Details' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Certificate reference details' })
  @Prop({ type: Types.ObjectId, ref: 'AssessmentCertificate', required: true })
  certificateType: Types.ObjectId;

  @ApiProperty({ description: 'Questions of Assessment' })
  @Prop({ type: [Types.ObjectId], ref: 'QuestionBank', required: true })
  questions: Types.ObjectId[];

  @ApiProperty({ description: 'Status of Assessment' })
  @Prop({ type: Boolean, default: true })
  active: boolean;

  @ApiProperty({ description: 'Status of duplicate Assessment' })
  @Prop({ type: Boolean, default: false })
  isCopy: boolean;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
