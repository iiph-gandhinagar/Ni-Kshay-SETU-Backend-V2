import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @ApiProperty({ description: 'Question of Feedback' })
  @Prop({ type: Object, required: true })
  question: object;

  @ApiProperty({ description: 'Description of Feedback' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'Feedback Value of Feedback' })
  @Prop({ type: Number, required: true })
  feedbackValue: number;

  @ApiProperty({ description: 'Feedback time of Feedback' })
  @Prop({ type: Number, required: true })
  feedbackTime: number;

  @ApiProperty({ description: 'Feedback type of Feedback' })
  @Prop({ type: String, required: true })
  feedbackType: string;

  @ApiProperty({ description: 'Feedback Days of Feedback' })
  @Prop({ type: Number, required: true })
  feedbackDays: number;

  @ApiProperty({ description: 'Feedback Icon of Feedback' })
  @Prop({ type: String, required: true })
  feedbackIcon: string;

  @ApiProperty({ description: 'Active Status of Feedback' })
  @Prop({ type: Boolean, required: true })
  active: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
