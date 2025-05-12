import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type TemporaryTokenDocument = TemporaryToken & Document;

@Schema({ timestamps: true })
export class TemporaryToken {
  @ApiProperty({ description: 'Name of the Temporary Token' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Email of the Temporary Token' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ description: 'Token of the Temporary Token' })
  @Prop({ required: true })
  token: string;

  @ApiProperty({ description: 'Expired Time and Date of Token' })
  @Prop({ type: Date, required: false })
  expiredDate: Date;

  @ApiProperty({ description: 'Admin User Id of the Temporary Token' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  adminUserId: Types.ObjectId;
}

export const TemporaryTokenSchema =
  SchemaFactory.createForClass(TemporaryToken);
