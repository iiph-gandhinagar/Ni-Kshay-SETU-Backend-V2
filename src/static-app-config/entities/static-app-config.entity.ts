import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticAppConfigDocument = StaticAppConfig & Document;

@Schema({ timestamps: true })
export class StaticAppConfig {
  @ApiProperty({ description: 'Key of the App Config' })
  @Prop({ type: String, required: true, unique: true })
  key: string;

  @ApiProperty({ description: 'Type of App Config Content' })
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ description: 'Value of the App Config' })
  @Prop({ type: Object, required: true })
  value: object;
}

export const StaticAppConfigSchema =
  SchemaFactory.createForClass(StaticAppConfig);
