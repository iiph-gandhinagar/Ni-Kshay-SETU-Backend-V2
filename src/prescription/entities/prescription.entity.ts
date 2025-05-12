import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true })
export class Prescription {
  @ApiProperty({ description: 'Diagnosis of the user prescription' })
  @Prop({ required: true })
  diagnosis: string;

  @ApiProperty({ description: 'Regimen of the user prescription' })
  @Prop({ required: true })
  regimen: string;

  @ApiProperty({ description: 'Prescription of the user prescription' })
  @Prop({ required: true })
  prescription: string;

  @ApiProperty({ description: 'Notes of the user prescription' })
  @Prop({ required: true })
  notes: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
