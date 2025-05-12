import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type DistrictDocument = District & Document;

@Schema({ timestamps: true })
export class District {
  @ApiProperty({ description: 'Country id of the District' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the District' })
  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'Title of the District' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Id Of mysql data' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const DistrictSchema = SchemaFactory.createForClass(District);
