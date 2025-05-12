import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type PrimaryCadreDocument = PrimaryCadre & Document;

@Schema({ timestamps: true })
export class PrimaryCadre {
  @ApiProperty({ description: 'Title of Primary Cadre' })
  @Prop({ type: String, required: true, unique: true })
  title: string;

  @ApiProperty({ description: 'Audience id of kbase in Primary Cadre' })
  @Prop({ type: String, required: true, unique: true })
  audienceId: string;
}

export const PrimaryCadreSchema = SchemaFactory.createForClass(PrimaryCadre);
