import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AppConfigDocument = AppConfig & Document;

@Schema({ timestamps: true })
export class AppConfig {
  @ApiProperty({ description: 'Key of the App Config' })
  @Prop({ required: true })
  key: string;

  @ApiProperty({ description: 'Value of the App Config' })
  @Prop({ type: Object, required: true })
  value: object;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
