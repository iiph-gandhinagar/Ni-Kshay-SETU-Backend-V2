import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type MasterCmDocument = MasterCm & Document;

@Schema({ timestamps: true })
export class MasterCm {
  @ApiProperty({ description: 'Title Of master cms' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Description Of master cms' })
  @Prop({ type: Object, required: true })
  description: object;
}

export const MasterCmSchema = SchemaFactory.createForClass(MasterCm);
