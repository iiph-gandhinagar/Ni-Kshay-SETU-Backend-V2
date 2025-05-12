import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  @ApiProperty({ description: 'Title of the Block' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Country id of the Block' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the Block' })
  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'district id of the Block' })
  @Prop({ type: Types.ObjectId, ref: 'District', required: true })
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Id of mysql' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
