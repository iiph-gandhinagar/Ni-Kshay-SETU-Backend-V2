import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SymptomDocument = Symptom & Document;
@Schema({ timestamps: true })
export class Symptom {
  @ApiProperty({ description: 'Title of the Symptom' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Country id of the Symptom' })
  @Prop({ required: true })
  category: string;

  @ApiProperty({ description: 'Icon of the Symptom' })
  @Prop({ type: String, required: true })
  icon: string;
}

export const SymptomSchema = SchemaFactory.createForClass(Symptom);
