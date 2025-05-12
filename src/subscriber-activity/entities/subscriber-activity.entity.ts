import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type SubscriberActivityDocument = SubscriberActivity & Document;

@Schema({ timestamps: true })
export class SubscriberActivity {
  @ApiProperty({ description: 'User Id' })
  @Prop({
    type: Types.ObjectId,
    ref: 'Subscriber',
    required: false,
    index: true,
  })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Module Name' })
  @Prop({ type: String, required: true })
  module: string;

  @ApiProperty({ description: 'Type of Request' })
  @Prop({ type: String, required: false })
  type: string;

  @ApiProperty({ description: 'Sub module Id name' })
  @Prop({ type: Types.ObjectId, required: false })
  subModule: Types.ObjectId;

  @ApiProperty({ description: 'Action Perform name' })
  @Prop({ type: String, required: true })
  action: string;

  @ApiProperty({ description: 'Total Time required for sub Modules' })
  @Prop({ type: Number, required: false })
  totalTime: number;

  @ApiProperty({ description: 'Time Spent for sub Modules' })
  @Prop({ type: Number, required: false })
  timeSpent: number;

  @ApiProperty({ description: 'Module Completed or not' })
  @Prop({ type: Boolean, default: false })
  completedFlag: boolean;

  @ApiProperty({ description: 'Ip Address of User' })
  @Prop({ type: String, default: true })
  ipAddress: string;

  @ApiProperty({ description: 'Platform of User' })
  @Prop({ type: String, default: true })
  platform: string;

  @ApiProperty({ description: 'Payload' })
  @Prop({ type: Object, required: false })
  payload: object;

  @ApiProperty({ description: 'MYsql id' })
  @Prop({ type: String, required: false })
  id: string;
}

export const SubscriberActivitySchema =
  SchemaFactory.createForClass(SubscriberActivity);
SubscriberActivitySchema.index({ userId: 1 });
SubscriberActivitySchema.index({ createdAt: 1 });
SubscriberActivitySchema.index({ action: 1 });
SubscriberActivitySchema.index({ userId: 1, createdAt: -1 });
