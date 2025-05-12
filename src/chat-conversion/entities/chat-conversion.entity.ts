import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ChatConversionDocument = ChatConversion & Document;

@Schema({ timestamps: true })
export class ChatConversion {
  @ApiProperty({ description: 'Subscriber of the Chat conversions' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Message of the Chat conversions' })
  @Prop({
    type: [
      {
        question: { type: [Object], required: true },
        answer: { type: [Object], required: true },
        type: { type: String, required: true }, // e.g., by keyword, by search
        category: { type: String, required: true }, // e.g., NTEP, system tool
        platform: { type: String, required: true }, // e.g., mobile, web
        like: { type: Boolean, required: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    required: true,
  })
  message: {
    question: object[];
    answer: object[];
    type: string;
    category: string;
    platform: string;
    like: boolean;
    createdAt: Date;
  }[];

  @ApiProperty({ description: 'Session Id of the Chat conversions' })
  @Prop({ type: String, required: true })
  sessionId: string;
}

export const ChatConversionSchema =
  SchemaFactory.createForClass(ChatConversion);
