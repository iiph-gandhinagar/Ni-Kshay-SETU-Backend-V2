import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type SurveyMasterDocument = SurveyMaster & Document;
@Schema({ timestamps: true })
export class Question {
  @ApiProperty({ description: 'Title of the question' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Type of the question' })
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ description: 'Option 1 for the question' })
  @Prop({ type: Object, required: false })
  option1: object;

  @ApiProperty({ description: 'Option 2 for the question' })
  @Prop({ type: Object, required: false })
  option2: object;

  @ApiProperty({ description: 'Option 3 for the question' })
  @Prop({ type: Object, required: false })
  option3: object;

  @ApiProperty({ description: 'Option 4 for the question' })
  @Prop({ type: Object, required: false })
  option4: object;

  @ApiProperty({ description: 'Is the question active?' })
  @Prop({ type: Boolean, default: true })
  active: boolean;

  @ApiProperty({ description: 'Order index of the question' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Created At of the question' })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class SurveyMaster {
  @ApiProperty({ description: 'Title of the Survey' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Country id of the Survey' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the Survey' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: true })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'District id of the Survey' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'District' }], required: false })
  districtId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of District' })
  @Prop({ type: Boolean, default: false })
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Block id of the Survey' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Block' }], required: false })
  blockId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of District' })
  @Prop({ type: Boolean, default: false })
  isAllBlock: boolean;

  @ApiProperty({ description: 'District id of the Survey' })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'HealthFacility' }],
    required: false,
  })
  healthFacilityId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of District' })
  @Prop({ type: Boolean, default: false })
  isAllHealthFacility: boolean;

  @ApiProperty({ description: 'Cadre id of the Survey' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: true })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Cadre Type of the Survey' })
  @Prop({ type: [String], required: false })
  cadreType: [string];

  @ApiProperty({ description: 'Questions of survey' })
  @Prop({ type: [Question], required: true })
  questions: Question[];

  @ApiProperty({ description: 'Active Status of the Survey' })
  @Prop({ type: Boolean, default: true })
  active: boolean;

  @ApiProperty({ description: 'Send Initial Notification flag of the Survey' })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;
}

export const SurveyMasterSchema = SchemaFactory.createForClass(SurveyMaster);
