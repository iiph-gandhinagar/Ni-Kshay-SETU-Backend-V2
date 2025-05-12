import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AlgorithmLatentTbInfection {
  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'Node Type of Latent Tb Infection Algorithm' })
  @Prop({ type: String, required: true })
  nodeType: string;

  @ApiProperty({
    description: 'Expandable Status of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  isExpandable: boolean;

  @ApiProperty({
    description: 'Has Option Status of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  hasOptions: boolean;

  @ApiProperty({ description: 'Time Spent of Latent Tb Infection Algorithm' })
  @Prop({ type: String, required: false })
  timeSpent: string;

  @ApiProperty({
    description: 'Expandable Status of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  masterNodeId: Types.ObjectId;

  @ApiProperty({ description: 'Index of Latent Tb Infection Algorithm' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'header of Latent Tb Infection Algorithm' })
  @Prop({ type: Object, required: false })
  header: object;

  @ApiProperty({ description: 'Sub Header of Latent Tb Infection Algorithm' })
  @Prop({ type: Object, required: false })
  subHeader: object;

  @ApiProperty({
    description: 'Redirect Algo Type of Latent Tb Infection Algorithm',
  })
  @Prop({ type: String, required: false })
  redirectAlgoType: string;

  @ApiProperty({
    description: 'Redirect Node id of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Types.ObjectId, required: false })
  redirectNodeId: Types.ObjectId;

  @ApiProperty({ description: 'State Ids of Latent Tb Infection Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: false })
  stateIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: [String], required: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadre Ids of Latent Tb Infection Algorithm' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: false })
  cadreIds: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of Latent Tb Infection Algorithm' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Icon of Latent Tb Infection Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Description of Latent Tb Infection Algorithm' })
  @Prop({ type: Object, required: false })
  description: object;

  @ApiProperty({ description: 'ParentId of Latent Tb Infection Algorithm' })
  @Prop({
    type: Types.ObjectId,
    ref: 'AlgorithmLatentTbInfection',
    required: false,
  })
  parentId: Types.ObjectId | null;

  @ApiProperty({
    description: 'Active Status of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Boolean, default: true })
  activated: boolean;

  @ApiProperty({
    description: 'Send Initial Notification of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Boolean, default: false })
  sendInitialNotification: boolean;

  @ApiProperty({
    description: 'Deleted date and time of Latent Tb Infection Algorithm',
  })
  @Prop({ type: Date })
  deletedAt: Date | null;
}

export const AlgorithmLatentTbInfectionSchema = SchemaFactory.createForClass(
  AlgorithmLatentTbInfection,
);

// Virtual field to define children relationship
AlgorithmLatentTbInfectionSchema.virtual('children', {
  ref: 'AlgorithmLatentTbInfection',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
AlgorithmLatentTbInfectionSchema.set('toObject', { virtuals: true });
AlgorithmLatentTbInfectionSchema.set('toJSON', { virtuals: true });

export type AlgorithmLatentTbInfectionDocument = Document &
  AlgorithmLatentTbInfection & {
    children?: AlgorithmLatentTbInfectionDocument[]; // Children are optional as they may not always be loaded
  };
