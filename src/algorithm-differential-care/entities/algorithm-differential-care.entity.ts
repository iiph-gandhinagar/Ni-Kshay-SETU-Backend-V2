import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AlgorithmDifferentialCare {
  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'Node Type of Differential Care Algorithm' })
  @Prop({ type: String, required: true })
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of Differential Care Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of Differential Care Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  hasOptions: boolean;

  @ApiProperty({ description: 'Time Spent of Differential Care Algorithm' })
  @Prop({ type: String, required: false })
  timeSpent: string;

  @ApiProperty({
    description: 'Expandable Status of Differential Care Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  masterNodeId: Types.ObjectId;

  @ApiProperty({ description: 'Index of Differential Care Algorithm' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'header of Differential Care Algorithm' })
  @Prop({ type: Object, required: false })
  header: object;

  @ApiProperty({ description: 'Sub Header of Differential Care Algorithm' })
  @Prop({ type: Object, required: false })
  subHeader: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Differential Care Algorithm',
  })
  @Prop({ type: String, required: false })
  redirectAlgoType: string;

  @ApiProperty({
    description: 'Redirect Node id of Differential Care Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  redirectNodeId: Types.ObjectId;

  @ApiProperty({ description: 'State Ids of Differential Care Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: false })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: [String], required: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadre Ids of Differential Care Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: false })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Differential Care Algorithm' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Icon of Differential Care Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Description of Differential Care Algorithm' })
  @Prop({ type: Object, required: false })
  description: object;

  @ApiProperty({ description: 'ParentId of Differential Care Algorithm' })
  @Prop({
    type: Types.ObjectId,
    ref: 'AlgorithmDifferentialCare',
    required: false,
  })
  parentId: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of Differential Care Algorithm',
  })
  @Prop({ type: Boolean, default: true })
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Differential Care Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Differential Care Algorithm',
  })
  @Prop({ type: Date })
  deletedAt: Date | null;
}

export const AlgorithmDifferentialCareSchema = SchemaFactory.createForClass(
  AlgorithmDifferentialCare,
);

// Virtual field to define children relationship
AlgorithmDifferentialCareSchema.virtual('children', {
  ref: 'AlgorithmDifferentialCare',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
AlgorithmDifferentialCareSchema.set('toObject', { virtuals: true });
AlgorithmDifferentialCareSchema.set('toJSON', { virtuals: true });

export type AlgorithmDifferentialCareDocument = Document &
  AlgorithmDifferentialCare & {
    children?: AlgorithmDifferentialCareDocument[]; // Children are optional as they may not always be loaded
  };
