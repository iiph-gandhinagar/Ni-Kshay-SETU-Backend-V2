import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type StateDocument = State & Document;

@Schema({ timestamps: true })
export class State {
  @ApiProperty({ description: 'Title of the state' })
  @Prop({ required: true, unique: true })
  title: string;

  @ApiProperty({ description: 'Country id of the state' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'id of the state' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const StateSchema = SchemaFactory.createForClass(State);
