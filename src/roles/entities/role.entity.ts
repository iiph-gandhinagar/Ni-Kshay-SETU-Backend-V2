import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Role {
  @ApiProperty({ description: 'Name Of the Role' })
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'Description Of Role' })
  @Prop({ type: String, required: false })
  description: string;

  @ApiProperty({ description: 'Permissions Of Role' })
  @Prop({ type: [String], required: true })
  permission: string[];
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
