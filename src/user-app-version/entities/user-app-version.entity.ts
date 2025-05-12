import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type UserAppVersionDocument = UserAppVersion & Document;

@Schema({ timestamps: true })
export class UserAppVersion {
  @ApiProperty({ description: 'user Id Phone App version' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'user Name App version' })
  @Prop({ type: String, required: true })
  userName: string;

  @ApiProperty({ description: 'App Version of user' })
  @Prop({ type: String, required: true })
  appVersion: string;

  @ApiProperty({ description: 'Platform of users App' })
  @Prop({ type: String, required: true })
  currentPlatform: string;

  @ApiProperty({ description: 'Has Ios App Version' })
  @Prop({ type: Boolean, default: false })
  hasIos: boolean;

  @ApiProperty({ description: 'Has Android App Version' })
  @Prop({ type: Boolean, default: false })
  hasAndroid: boolean;

  @ApiProperty({ description: 'Has Web App Version' })
  @Prop({ type: Boolean, default: false })
  hasWeb: boolean;
}

export const UserAppVersionSchema =
  SchemaFactory.createForClass(UserAppVersion);
