import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserDeviceToken {
  @ApiProperty({ description: 'Device Id Details' })
  @Prop({ type: String, required: true })
  deviceId: string;

  @ApiProperty({ description: 'Notification Token of user ' })
  @Prop({ required: true })
  notificationToken: string;

  @ApiProperty({ description: 'Subscribers Details' })
  @Prop({
    type: Types.ObjectId,
    ref: 'Subscriber',
    required: true,
  })
  userId: string;

  @ApiProperty({ description: 'Is Active flag' })
  @Prop({ type: Number, default: 1 })
  isActive: number;
}

export type UserDeviceTokenDocument = UserDeviceToken & Document;
export const UserDeviceTokenSchema =
  SchemaFactory.createForClass(UserDeviceToken);
