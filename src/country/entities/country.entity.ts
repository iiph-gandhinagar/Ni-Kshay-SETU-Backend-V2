import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Country {
  @Prop({ type: String, required: true, unique: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'id of mysql data' })
  @Prop({ type: Number })
  id: number;
}

export type CountryDocument = Country & Document;
export const CountrySchema = SchemaFactory.createForClass(Country);
