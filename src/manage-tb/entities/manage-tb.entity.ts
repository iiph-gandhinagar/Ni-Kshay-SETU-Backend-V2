import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ManageTbDocument = ManageTb & Document;
@Schema({ timestamps: true })
export class ManageTb {
  @ApiProperty({ description: 'Title of Manage Tb Changes' })
  @Prop({ type: 'String', required: true })
  title: string;

  @ApiProperty({ description: 'Created By Admin User Details' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;
}

export const ManageTbSchema = SchemaFactory.createForClass(ManageTb);
