import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AlgorithmDiagnosis {
  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'Node Type of Diagnosis Algorithm' })
  @Prop({ type: String, required: true })
  nodeType: string;

  @ApiProperty({ description: 'Expandable Status of Diagnosis Algorithm' })
  @Prop({ type: Boolean, default: false })
  isExpandable: boolean;

  @ApiProperty({ description: 'Has Option Status of Diagnosis Algorithm' })
  @Prop({ type: Boolean, default: false })
  hasOptions: boolean;

  @ApiProperty({ description: 'Time Spent of Diagnosis Algorithm' })
  @Prop({ type: String, required: false })
  timeSpent: string;

  @ApiProperty({ description: 'Expandable Status of Diagnosis Algorithm' })
  @Prop({ type: Types.ObjectId, required: false })
  masterNodeId: Types.ObjectId;

  @ApiProperty({ description: 'Index of Diagnosis Algorithm' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'header of Diagnosis Algorithm' })
  @Prop({ type: Object, required: false })
  header: object;

  @ApiProperty({ description: 'Sub Header of Diagnosis Algorithm' })
  @Prop({ type: Object, required: false })
  subHeader: object;

  @ApiProperty({ description: 'Redirect Algo Type of Diagnosis Algorithm' })
  @Prop({ type: String, required: false })
  redirectAlgoType: string;

  @ApiProperty({ description: 'Redirect Node id of Diagnosis Algorithm' })
  @Prop({ type: Types.ObjectId, required: false })
  redirectNodeId: Types.ObjectId;

  @ApiProperty({ description: 'State Ids of Diagnosis Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: false })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: [String], required: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadre Ids of Diagnosis Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: false })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Icon of Diagnosis Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Title of Diagnosis Algorithm' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Description of Diagnosis Algorithm' })
  @Prop({ type: Object, required: false })
  description: object;

  @ApiProperty({ description: 'ParentId of Diagnosis Algorithm' })
  @Prop({
    type: Types.ObjectId,
    ref: 'AlgorithmDiagnosis',
    required: false,
  })
  parentId: Types.ObjectId | null;

  @ApiProperty({ description: 'Active Status of Diagnosis Algorithm' })
  @Prop({ type: Boolean, default: true })
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Diagnosis Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Diagnosis Algorithm',
  })
  @Prop({ type: Date })
  deletedAt: Date | null;
}

export const AlgorithmDiagnosisSchema =
  SchemaFactory.createForClass(AlgorithmDiagnosis);

// Virtual field to define children relationship
AlgorithmDiagnosisSchema.virtual('children', {
  ref: 'AlgorithmDiagnosis',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
AlgorithmDiagnosisSchema.set('toObject', { virtuals: true });
AlgorithmDiagnosisSchema.set('toJSON', { virtuals: true });

export type AlgorithmDiagnosisDocument = Document &
  AlgorithmDiagnosis & {
    children?: AlgorithmDiagnosisDocument[]; // Children are optional as they may not always be loaded
  };
