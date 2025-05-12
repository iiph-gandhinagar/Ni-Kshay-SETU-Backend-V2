import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticKeyFeatureDocument = StaticKeyFeature & Document;

@Schema({ timestamps: true })
export class StaticKeyFeature {
  @ApiProperty({ description: 'Title of the Key Features' })
  @Prop({ type: Object, required: true, unique: true })
  title: object;

  @ApiProperty({ description: 'Description of Key Features' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'Icon of Key Features' })
  @Prop({ type: [String], required: true })
  icon: string[];

  @ApiProperty({ description: 'Icon of Key Features' })
  @Prop({ type: [String], required: true })
  backgroundIcon: string[];

  @ApiProperty({ description: 'order Index of Key features' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the Key Features' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticKeyFeatureSchema =
  SchemaFactory.createForClass(StaticKeyFeature);
