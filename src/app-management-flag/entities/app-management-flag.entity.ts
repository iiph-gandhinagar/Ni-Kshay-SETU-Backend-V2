import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type AppManagementDocument = AppManagementFlag & Document;
@Schema({ timestamps: true })
export class AppManagementFlag {
  @ApiProperty({ description: 'Variable of App Management flag' })
  @Prop({ required: true })
  variable: string;

  @ApiProperty({ description: 'Value of the App Management' })
  @Prop({ type: Object, required: true })
  value: object;
}

export const AppManagementSchema =
  SchemaFactory.createForClass(AppManagementFlag);
