import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ScreeningDocument = Screening & Document;

@Schema({ timestamps: true })
export class Screening {
  @ApiProperty({ description: 'User of the Screening Tool' })
  @Prop({ type: String, required: true })
  userId: string;

  @ApiProperty({ description: 'Age of the Screening Tool' })
  @Prop({ type: Number, required: true })
  age: number;

  @ApiProperty({ description: 'Weight of the Screening Tool' })
  @Prop({ type: Number, required: true })
  weight: number;

  @ApiProperty({ description: 'Height of the Screening Tool' })
  @Prop({ type: Number, required: true })
  height: number;

  @ApiProperty({ description: 'Symptoms Selected of the Screening Tool' })
  @Prop({ type: [String], required: true })
  symptomSelected: string[];

  @ApiProperty({ description: 'Symptoms Name of the Screening Tool' })
  @Prop({ type: String, required: true })
  symptomName: string;

  @ApiProperty({ description: 'Tb flag of the Screening Tool' })
  @Prop({ type: Boolean, required: true })
  isTb: boolean;
}

export const ScreeningSchema = SchemaFactory.createForClass(Screening);
