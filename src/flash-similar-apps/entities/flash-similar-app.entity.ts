import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type FlashSimilarAppDocument = FlashSimilarApp & Document;

@Schema({ timestamps: true })
export class FlashSimilarApp {
  @ApiProperty({ description: 'Title of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Image of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  image: string;

  @ApiProperty({ description: 'Sub Title of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  subTitle: string;

  @ApiProperty({ description: 'Href of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  href: string;

  @ApiProperty({ description: 'Href Web of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  hrefWeb: string;

  @ApiProperty({ description: 'Href ios of the Flash Similar Apps' })
  @Prop({ type: String, required: true })
  hrefIos: string;

  @ApiProperty({ description: 'Order Index of the Flash Similar Apps' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active Status of Flash Similar Apps' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const FlashSimilarAppSchema =
  SchemaFactory.createForClass(FlashSimilarApp);
