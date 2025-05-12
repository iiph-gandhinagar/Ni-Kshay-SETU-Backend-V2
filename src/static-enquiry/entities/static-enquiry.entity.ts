import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticEnquiryDocument = StaticEnquiry & Document;
@Schema({ timestamps: true })
export class StaticEnquiry {
  @ApiProperty({ description: 'Subject of the Enquiry' })
  @Prop({ type: String, required: true })
  subject: string;

  @ApiProperty({ description: 'Message of the Enquiry' })
  @Prop({ type: String, required: true })
  message: string;

  @ApiProperty({ description: 'Email of the Enquiry' })
  @Prop({ type: String, required: true })
  email: string;
}

export const StaticEnquirySchema = SchemaFactory.createForClass(StaticEnquiry);
