import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticModuleDocument = StaticModule & Document;

@Schema({ timestamps: true })
export class StaticModule {
  @ApiProperty({ description: 'Title of the modules' })
  @Prop({ type: Object, required: true, unique: true })
  title: object;

  @ApiProperty({ description: 'Description of modules' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'Slug of Modules' })
  @Prop({
    type: String,
    required: true,
  })
  slug: string;

  @ApiProperty({ description: 'image of modules' })
  @Prop({ type: [String], required: true })
  image: string[];

  @ApiProperty({ description: 'order Index of modules' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the modules' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticModuleSchema = SchemaFactory.createForClass(StaticModule);
