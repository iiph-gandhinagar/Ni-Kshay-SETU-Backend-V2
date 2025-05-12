import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AdminActivityDocument = AdminActivity & Document;

@Schema({ timestamps: true })
export class AdminActivity {
  @ApiProperty({ description: 'Action Details like (Create,edit,delete)' })
  @Prop({ type: String, required: true })
  action: string;

  @ApiProperty({ description: 'Module name' })
  @Prop({ type: String, required: true })
  moduleName: string;

  @ApiProperty({ description: '' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  causerId: Types.ObjectId;

  @ApiProperty({ description: '' })
  @Prop({ type: Object, required: true })
  payload: object;
}

export const AdminActivitySchema = SchemaFactory.createForClass(AdminActivity);
