import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type FlashNewsDocument = FlashNews & Document;

@Schema({ timestamps: true })
export class FlashNews {
  @ApiProperty({ description: 'Title of the Flash News' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Description of the Flash News' })
  @Prop({ type: String, required: false })
  description: string;

  @ApiProperty({ description: 'Image of the Flash News' })
  @Prop({ type: String, required: false })
  image: string;

  @ApiProperty({ description: 'Author of the Flash News Content' })
  @Prop({ type: String, required: false })
  author: string;

  @ApiProperty({ description: 'Source of the Flash News Content' })
  @Prop({ type: String, required: true })
  source: string;

  @ApiProperty({ description: 'Href of the Flash News Content' })
  @Prop({ type: String, required: false })
  href: string;

  @ApiProperty({ description: 'Publish Date of the Flash News Content' })
  @Prop({ type: Date, required: false })
  publishDate: Date;

  @ApiProperty({ description: 'order Index of the Flash News Content' })
  @Prop({ type: Number, default: 1000 })
  orderIndex: number;

  @ApiProperty({ description: 'Active Status of the Flash News Content' })
  @Prop({ type: Boolean, default: false })
  active: boolean;
}

export const FlashNewsSchema = SchemaFactory.createForClass(FlashNews);
