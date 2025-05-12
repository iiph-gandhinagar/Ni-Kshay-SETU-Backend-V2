import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AutomaticNotificationDocument = AutomaticNotification & Document;

@Schema({ timestamps: true })
export class AutomaticNotification {
  @ApiProperty({ description: 'Title od Automatic Notification' })
  @Prop({ type: [Types.ObjectId], ref: 'Subscriber', required: true })
  userId: Types.ObjectId[];

  @ApiProperty({ description: 'Title od Automatic Notification' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Description of Automatic Notification' })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({ description: 'Type of Automatic Notification' })
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ description: 'Redirect Link of Automatic Notification' })
  @Prop({ type: String, required: true })
  link: string;

  @ApiProperty({ description: 'Type of Automatic Notification' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;

  @ApiProperty({
    description: 'Count of successfully send Automatic Notification',
  })
  @Prop({ type: Boolean, default: false })
  successfulCount: boolean;

  @ApiProperty({
    description: 'Count of Failed Automatic Notification',
  })
  @Prop({ type: Boolean, default: false })
  failedCount: boolean;

  @ApiProperty({
    description: 'status Automatic Notification',
  })
  @Prop({ type: String, default: false })
  status: string;
}

export const AutomaticNotificationSchema = SchemaFactory.createForClass(
  AutomaticNotification,
);
