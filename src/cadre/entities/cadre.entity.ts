import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type CadreDocument = Cadre & Document;

@Schema({ timestamps: true })
export class Cadre {
  @ApiProperty({ description: 'Title of the cadre' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Cadre Group of Cadre' })
  @Prop({ type: Types.ObjectId, ref: 'PrimaryCadre', required: true })
  cadreGroup: Types.ObjectId;

  @ApiProperty({ description: 'Cadre Type of Cadre' })
  @Prop({ required: true })
  cadreType: string; // cadre group field is required so reference of cadre group id and master data need to create

  @ApiProperty({ description: 'id of the Cadre' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const CadreSchema = SchemaFactory.createForClass(Cadre);
