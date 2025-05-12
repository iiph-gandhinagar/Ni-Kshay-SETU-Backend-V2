import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type FeedbackHistoryDocument = FeedbackHistory & Document;

@Schema({ timestamps: true })
export class FeedbackHistory {
  @ApiProperty({ description: 'User Id of Feedback History' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Feedback Id of Feedback History' })
  @Prop({ type: Types.ObjectId, ref: 'Feedback', required: true })
  feedbackId: Types.ObjectId;

  @ApiProperty({ description: 'Rating of Feedback History' })
  @Prop({ type: Number, required: false })
  ratings: number;

  @ApiProperty({ description: 'Review of Feedback History' })
  @Prop({ type: String, required: false })
  review: string;

  @ApiProperty({ description: 'Skip of Feedback History' })
  @Prop({ type: Boolean, required: false })
  skip: boolean;
}

export const FeedbackHistorySchema =
  SchemaFactory.createForClass(FeedbackHistory);
