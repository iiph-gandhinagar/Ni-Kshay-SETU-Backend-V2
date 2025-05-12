import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type AbbreviationDocument = Abbreviation & Document;

@Schema({ timestamps: true })
export class Abbreviation {
  @ApiProperty({ description: 'Title of the Abbreviation' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Patterns of the Abbreviation' })
  @Prop({ type: [String], required: true })
  patterns: string[];
}

export const AbbreviationSchema = SchemaFactory.createForClass(Abbreviation);
