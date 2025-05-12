import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission {
  @ApiProperty({ description: 'Name of the Permission' })
  @Prop({ type: String, require: true, unique: true })
  name: string;

  @ApiProperty({ description: 'Description of Permission' })
  @Prop({ type: String, required: false })
  description: string;

  @ApiProperty({ description: 'Module Name of Permission' })
  @Prop({ type: String, required: false })
  moduleName: string;

  @ApiProperty({ description: 'Active Status of Permission' })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}
export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);
