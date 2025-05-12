import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type OldAssessmentResultDocument = OldAssessmentResult & Document;

@Schema({ timestamps: true })
export class OldAssessmentResult {
  @ApiProperty({ description: 'Assessment Details' })
  @Prop({ type: String, required: true })
  assessmentId: string;

  @ApiProperty({ description: 'Subscriber Details' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Total marks of an Assessment' })
  @Prop({ type: Number, required: false })
  totalMarks: number;

  @ApiProperty({ description: 'Total Time of an Assessment' })
  @Prop({ type: Number, required: true })
  totalTime: number;

  @ApiProperty({ description: 'Obtained Marks Details' })
  @Prop({ type: Number, required: false, default: 0 })
  obtainedMarks: number;

  @ApiProperty({ description: 'How many Question Attempted' })
  @Prop({ type: Number, required: false, default: 0 })
  attempted: number;

  @ApiProperty({ description: 'How many Right Answers' })
  @Prop({ type: Number, required: false, default: 0 })
  rightAnswer: number;

  @ApiProperty({ description: 'How Many Wrong Answers' })
  @Prop({ type: Number, required: false, default: 0 })
  wrongAnswer: number;

  @ApiProperty({ description: 'How Many Questions skip' })
  @Prop({ type: Number, required: false, default: 0 })
  skipped: number;

  @ApiProperty({ description: 'Is marks Calculated' })
  @Prop({ type: Boolean, default: 0 })
  isCalculated: boolean;

  @ApiProperty({ description: 'Time to complete' })
  @Prop({ type: String, required: false })
  timeToComplete: string;

  @ApiProperty({ description: 'Assessment Type' })
  @Prop({ type: String, required: false })
  assessmentType: string;

  @ApiProperty({ description: 'Activated assessments' })
  @Prop({ type: Boolean, required: false, default: 0 })
  activated: boolean;

  @ApiProperty({ description: 'Assessment cadre Details' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: false })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'Assessment Country Details' })
  @Prop({ type: [Types.ObjectId], ref: 'Country', required: false })
  countryId: Types.ObjectId[];

  @ApiProperty({ description: 'Assessment District Details' })
  @Prop({ type: [Types.ObjectId], ref: 'District', required: false })
  districtId: Types.ObjectId[];

  @ApiProperty({ description: 'Assessment State Details' })
  @Prop({ type: [Types.ObjectId], ref: 'State', required: false })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'cadre Type' })
  @Prop({ type: String, required: false })
  cadreType: string;

  @ApiProperty({ description: 'From date ( planned assessment)' })
  @Prop({ type: Date, required: false })
  fromDate: Date;

  @ApiProperty({ description: 'To date ( planned assessment)' })
  @Prop({ type: Date, required: false })
  toDate: Date;

  @ApiProperty({ description: 'Assessment Title' })
  @Prop({ type: String, required: false })
  title: string;
}

export const OldAssessmentResultSchema =
  SchemaFactory.createForClass(OldAssessmentResult);
