import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AssessmentEnrollmentDocument = AssessmentEnrollment & Document;

@Schema({ timestamps: true })
export class AssessmentEnrollment {
  @ApiProperty({ description: 'Assessment Title' })
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Details' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Response of Subscriber' })
  @Prop({ type: String, required: false })
  response: string;

  @ApiProperty({ description: 'Send Notification status' })
  @Prop({ type: Boolean, required: true })
  sendInitialInvitation: boolean;
}

export const AssessmentEnrollmentSchema =
  SchemaFactory.createForClass(AssessmentEnrollment);
