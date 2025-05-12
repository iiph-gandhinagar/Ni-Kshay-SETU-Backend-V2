import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type PluginManagementDocument = PluginManagement & Document;

@Schema({ timestamps: true })
export class PluginManagement {
  @ApiProperty({ description: 'plugin Title' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Cadre Type' })
  @Prop({ type: String, required: true })
  cadreType: string;

  @ApiProperty({ description: 'Cadre of Plugin Access subscriber' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: false })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Status Flag' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;
}

export const PluginManagementSchema =
  SchemaFactory.createForClass(PluginManagement);
