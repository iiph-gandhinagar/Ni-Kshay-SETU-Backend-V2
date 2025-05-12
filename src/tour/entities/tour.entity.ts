import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type TourDocument = Tour & Document;

@Schema({ timestamps: true })
export class Tour {
  @ApiProperty({ description: 'Title of the Tour' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Tour Slides of the Tour' })
  @Prop({
    type: [
      {
        title: { type: Object, required: true },
        shortDescription: { type: Object, required: true },
        description: { type: Object, required: true },
        icon: { type: String, required: true },
        colorGradient: { type: [String], required: true },
        textColor: { type: [String], required: true },
        createdAt: { type: Date, default: Date.now },
        orderIndex: { type: Number, default: 1 },
      },
    ],
    required: true,
  })
  tourSlides: {
    title: object;
    shortDescription: object;
    description: object;
    icon: string;
    colorGradient: string[];
    textColor: string[];
    createdAt: Date;
    orderIndex: number;
  }[];

  @ApiProperty({ description: 'Active Status of the Tour', default: true })
  @Prop({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Default Status of the Tour', default: false })
  @Prop({ default: false })
  default: boolean;
}

export const TourSchema = SchemaFactory.createForClass(Tour);
