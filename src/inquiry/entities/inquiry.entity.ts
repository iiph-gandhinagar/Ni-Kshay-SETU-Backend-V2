import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type InquiryDocument = Inquiry & Document;

@Schema({ timestamps: true })
export class Inquiry {
  @ApiProperty({ description: 'Inquiry User Id' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Inquiry User Name' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ description: 'Inquiry User Email' })
  @Prop({ type: String, required: true })
  email: string;

  @ApiProperty({ description: 'Inquiry User PhoneNo' })
  @Prop({ type: String, required: true })
  phoneNo: string;

  @ApiProperty({ description: 'Inquiry User Subject' })
  @Prop({ type: String, required: true })
  subject: string;

  @ApiProperty({ description: 'Inquiry User Message' })
  @Prop({ type: String, required: true })
  message: string;

  @ApiProperty({ description: 'Inquiry User type' })
  @Prop({ type: String, required: false })
  type: string;
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);
