import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AlgorithmTreatment {
  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'Node Type of Treatment Algorithm' })
  @Prop({ type: String, required: true })
  nodeType: string;

  @ApiProperty({ description: 'Expandable Status of Treatment Algorithm' })
  @Prop({ type: Boolean, default: false })
  isExpandable: boolean;

  @ApiProperty({ description: 'Has Option Status of Treatment Algorithm' })
  @Prop({ type: Boolean, default: false })
  hasOptions: boolean;

  @ApiProperty({ description: 'Time Spent of Treatment Algorithm' })
  @Prop({ type: String, required: false })
  timeSpent: string;

  @ApiProperty({ description: 'Expandable Status of Treatment Algorithm' })
  @Prop({ type: Types.ObjectId, required: false })
  masterNodeId: Types.ObjectId;

  @ApiProperty({ description: 'Index of Treatment Algorithm' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'header of Treatment Algorithm' })
  @Prop({ type: Object, required: false })
  header: object;

  @ApiProperty({ description: 'Sub Header of Treatment Algorithm' })
  @Prop({ type: Object, required: false })
  subHeader: object;

  @ApiProperty({ description: 'Redirect Algo Type of Treatment Algorithm' })
  @Prop({ type: String, required: false })
  redirectAlgoType: string;

  @ApiProperty({ description: 'Redirect Node id of Treatment Algorithm' })
  @Prop({ type: Types.ObjectId, required: false })
  redirectNodeId: Types.ObjectId;

  @ApiProperty({ description: 'State Ids of Treatment Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: false })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: [String], required: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadre Ids of Treatment Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: false })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Treatment Algorithm' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Icon of Treatment Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Description of Treatment Algorithm' })
  @Prop({ type: Object, required: false })
  description: object;

  @ApiProperty({ description: 'ParentId of Treatment Algorithm' })
  @Prop({
    type: Types.ObjectId,
    ref: 'AlgorithmTreatment',
    required: false,
  })
  parentId: Types.ObjectId | null;

  @ApiProperty({ description: 'Active Status of Treatment Algorithm' })
  @Prop({ type: Boolean, default: true })
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Treatment Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Treatment Algorithm',
  })
  @Prop({ type: Date })
  deletedAt: Date | null;
}

export const AlgorithmTreatmentSchema =
  SchemaFactory.createForClass(AlgorithmTreatment);

// Virtual field to define children relationship
AlgorithmTreatmentSchema.virtual('children', {
  ref: 'AlgorithmTreatment',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
AlgorithmTreatmentSchema.set('toObject', { virtuals: true });
AlgorithmTreatmentSchema.set('toJSON', { virtuals: true });

export type AlgorithmTreatmentDocument = Document &
  AlgorithmTreatment & {
    children?: AlgorithmTreatmentDocument[]; // Children are optional as they may not always be loaded
  };
