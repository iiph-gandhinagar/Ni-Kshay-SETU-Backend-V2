import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserNotificationDocument = UserNotification & Document;

@Schema({ timestamps: true })
export class UserNotification {
  @ApiProperty({ description: 'Title Of User Notification' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Description Of User Notification' })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({ description: 'Type Of User Notification' })
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ description: 'Type Of User Notification' })
  @Prop({ type: [Types.ObjectId], ref: 'Subscriber', required: true })
  userId: Types.ObjectId[];

  @ApiProperty({ description: 'All Subscriber' })
  @Prop({ type: Boolean, required: false })
  isAllUser: boolean;

  @ApiProperty({ description: 'Country Id Of User Notification' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: false })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State Id Of User Notification' })
  @Prop({ type: [Types.ObjectId], ref: 'State', required: false })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'All state Flag' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'District Id Of User Notification' })
  @Prop({ type: [Types.ObjectId], ref: 'District', required: false })
  districtId: Types.ObjectId[];

  @ApiProperty({ description: 'All District flag' })
  @Prop({ type: Boolean, default: false })
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Cadre Type Of User Notification' })
  @Prop({ type: String, required: false })
  cadreType: string;

  @ApiProperty({ description: 'Cadre Id Of User Notification' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: false })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Created By Admin user Of User Notification' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Deep-linking Status Of User Notification' })
  @Prop({ type: Boolean, default: false })
  isDeepLink: boolean;

  @ApiProperty({
    description: 'Automatic Notification type Of User Notification',
  })
  @Prop({ type: String, required: false })
  automaticNotificationType: string;

  @ApiProperty({ description: 'Type of notification Of User Notification' })
  @Prop({ type: Types.ObjectId, required: false })
  typeTitle: Types.ObjectId;

  @ApiProperty({ description: 'Successful count Of User Notification' })
  @Prop({ type: Number, required: false })
  successfulCount: number;

  @ApiProperty({ description: 'Failed count Of User Notification' })
  @Prop({ type: Number, required: false })
  failedCount: number;

  @ApiProperty({ description: 'Status Of User Notification' })
  @Prop({ type: String, required: false })
  status: string;

  @ApiProperty({ description: 'Redirect Link of Automatic Notification' })
  @Prop({ type: String, required: false })
  link: string;
}

export const UserNotificationSchema =
  SchemaFactory.createForClass(UserNotification);
