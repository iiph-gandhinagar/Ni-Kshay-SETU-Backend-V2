import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticFaqDocument = StaticFaq & Document;

@Schema({ timestamps: true })
export class StaticFaq {
  @ApiProperty({ description: 'Question of the FAQ' })
  @Prop({ type: Object, required: true, unique: true })
  question: object;

  @ApiProperty({ description: 'Description of the FAQ' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'Order Index of the FAQ' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active Flag of the FAQ' })
  @Prop({ type: Boolean, required: true })
  active: boolean;
}
export const StaticFaqSchema = SchemaFactory.createForClass(StaticFaq);
