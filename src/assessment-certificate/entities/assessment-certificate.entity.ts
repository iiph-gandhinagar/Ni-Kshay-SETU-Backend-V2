import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AssessmentCertificateDocument = AssessmentCertificate & Document;

@Schema({ timestamps: true })
export class AssessmentCertificate {
  @ApiProperty({ description: 'Title of Certificate' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Top Value To set Content in Certificate' })
  @Prop({ type: Number, required: true })
  top: number;

  @ApiProperty({ description: 'left Value To set Content in Certificate' })
  @Prop({ type: Number, required: true })
  left: number;

  @ApiProperty({ description: 'Certificate image link' })
  @Prop({ type: String, required: true })
  image: string;

  @ApiProperty({ description: 'creation Admin user Details' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;
}

export const AssessmentCertificateSchema = SchemaFactory.createForClass(
  AssessmentCertificate,
);
