import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type StaticTestimonialDocument = StaticTestimonial & Document;
@Schema({ timestamps: true })
export class StaticTestimonial {
  @ApiProperty({ description: 'Name of the Testimonial' })
  @Prop({ type: Object, required: true, unique: true })
  name: object;

  @ApiProperty({ description: 'Description of Testimonial' })
  @Prop({ type: Object, required: true })
  description: object;

  @ApiProperty({ description: 'Icon of Testimonial' })
  @Prop({ type: [String], required: true })
  icon: string[];

  @ApiProperty({ description: 'order Index of Testimonial' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the Testimonial' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticTestimonialSchema =
  SchemaFactory.createForClass(StaticTestimonial);
