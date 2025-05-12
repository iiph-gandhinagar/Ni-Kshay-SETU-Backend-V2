import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticReleaseDocument = StaticRelease & Document;
@Schema({ timestamps: true })
export class StaticRelease {
  @ApiProperty({ description: 'Feature of the Release Details' })
  @Prop({ type: [Object], required: false })
  feature: object[];

  @ApiProperty({ description: 'Bug Fix of Release Details' })
  @Prop({ type: [Object], required: false })
  bugFix: object[];

  @ApiProperty({ description: 'Date of Release' })
  @Prop({ type: Date, required: true })
  date: Date;

  @ApiProperty({ description: 'order Index of Release Details' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the Release Details' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticReleaseSchema = SchemaFactory.createForClass(StaticRelease);
