import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticBlogDocument = StaticBlog & Document;

@Schema({ timestamps: true })
export class StaticBlog {
  @ApiProperty({ description: 'Title of the Blog' })
  @Prop({ type: Object, required: true, unique: true })
  title: object;

  @ApiProperty({ description: 'Slug of the Blog' })
  @Prop({ type: String, required: true })
  slug: string;

  @ApiProperty({ description: 'Short Description of the Blog' })
  @Prop({ type: Object, required: false })
  shortDescription: object;

  @ApiProperty({ description: 'Description of the Blog' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'order Index of the Blog' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Source of the Blog' })
  @Prop({ type: String, required: false })
  source: string;

  @ApiProperty({ description: 'Author of the Blog' })
  @Prop({ type: String, required: true })
  author: string;

  @ApiProperty({ description: 'image1 of the Blog' })
  @Prop({ required: true }) // String or array?
  image1: string;

  @ApiProperty({ description: 'image2 of the Blog' })
  @Prop({ required: false }) // String or array?
  image2: string;

  @ApiProperty({ description: 'image3 of the Blog' })
  @Prop({ required: false }) // String or array?
  image3: string;

  @ApiProperty({ description: 'Active status of the Blog' })
  @Prop({ type: Boolean, required: true })
  active: boolean;

  @ApiProperty({ description: 'Keywords of the Blog' })
  @Prop({ type: [String], required: true })
  keywords: string[];
}

export const StaticBlogSchema = SchemaFactory.createForClass(StaticBlog);
