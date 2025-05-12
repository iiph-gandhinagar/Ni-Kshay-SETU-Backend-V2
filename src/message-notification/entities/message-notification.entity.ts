import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type MessageNotificationDocument = MessageNotification & Document;

@Schema({ timestamps: true })
export class MessageNotification {
  @ApiProperty({ description: 'User Name ' })
  @Prop({ type: String, required: true })
  userName: string;

  @ApiProperty({ description: 'User Phone No ' })
  @Prop({ type: String, required: true })
  phoneNo: string;

  @ApiProperty({ description: 'message ' })
  @Prop({ type: String, required: true })
  message: string;
}

export const MessageNotificationSchema =
  SchemaFactory.createForClass(MessageNotification);
