import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticWhatWeDoDocument = StaticWhatWeDo & Document;
@Schema({ timestamps: true })
export class StaticWhatWeDo {
  @ApiProperty({ description: 'Title of the What we Do' })
  @Prop({ type: Object, required: true, unique: true })
  title: object;

  @ApiProperty({ description: 'Location of What we Do' })
  @Prop({ type: Object, required: true })
  location: object;

  @ApiProperty({ description: 'Cover Image of What we Do' })
  @Prop({ type: [String], required: true })
  coverImage: string[];

  @ApiProperty({ description: 'order Index of What we Do' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the What we Do' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticWhatWeDoSchema =
  SchemaFactory.createForClass(StaticWhatWeDo);
