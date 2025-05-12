import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AlgorithmCgcIntervention {
  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'Node Type of CGC Intervention Algorithm' })
  @Prop({ type: String, required: true })
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of CGC Intervention Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of CGC Intervention Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  hasOptions: boolean;

  @ApiProperty({ description: 'Time Spent of CGC Intervention Algorithm' })
  @Prop({ type: String, required: false })
  timeSpent: string;

  @ApiProperty({
    description: 'Expandable Status of CGC Intervention Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  masterNodeId: Types.ObjectId;

  @ApiProperty({ description: 'Index of CGC Intervention Algorithm' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'header of CGC Intervention Algorithm' })
  @Prop({ type: Object, required: false })
  header: object;

  @ApiProperty({ description: 'Sub Header of CGC Intervention Algorithm' })
  @Prop({ type: Object, required: false })
  subHeader: object;

  @ApiProperty({
    description: 'Redirect Algo Type of CGC Intervention Algorithm',
  })
  @Prop({ type: String, required: false })
  redirectAlgoType: string;

  @ApiProperty({
    description: 'Redirect Node id of CGC Intervention Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  redirectNodeId: Types.ObjectId;

  @ApiProperty({ description: 'State Ids of CGC Intervention Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: false })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: String, required: true })
  cadreType: string;

  @ApiProperty({ description: 'Cadre Ids of CGC Intervention Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: false })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of CGC Intervention Algorithm' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Icon of CGC Intervention Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Description of CGC Intervention Algorithm' })
  @Prop({ type: Object, required: false })
  description: object;

  @ApiProperty({ description: 'ParentId of CGC Intervention Algorithm' })
  @Prop({
    type: Types.ObjectId,
    ref: 'AlgorithmCgcIntervention',
    required: false,
  })
  parentId: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of CGC Intervention Algorithm',
  })
  @Prop({ type: Boolean, default: true })
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of CGC Intervention Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of CGC Intervention Algorithm',
  })
  @Prop({ type: Date })
  deletedAt: Date | null;
}

export const AlgorithmCgcInterventionSchema = SchemaFactory.createForClass(
  AlgorithmCgcIntervention,
);

// Virtual field to define children relationship
AlgorithmCgcInterventionSchema.virtual('children', {
  ref: 'AlgorithmCgcIntervention',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
AlgorithmCgcInterventionSchema.set('toObject', { virtuals: true });
AlgorithmCgcInterventionSchema.set('toJSON', { virtuals: true });

export type AlgorithmCgcInterventionDocument = Document &
  AlgorithmCgcIntervention & {
    children?: AlgorithmCgcInterventionDocument[]; // Children are optional as they may not always be loaded
  };
