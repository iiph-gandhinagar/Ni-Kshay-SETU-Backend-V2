import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type QuestionBankDocument = QuestionBank & Document;

@Schema({ timestamps: true })
export class QuestionBank {
  @ApiProperty({ description: 'Language of questions' })
  @Prop({ type: String, required: true })
  language: string;

  @ApiProperty({ description: 'Questions Details' })
  @Prop({ type: String, required: true })
  question: string;

  @ApiProperty({ description: 'Option 1' })
  @Prop({ type: String, required: true })
  option1: string;

  @ApiProperty({ description: 'Option 2' })
  @Prop({ type: String, required: true })
  option2: string;

  @ApiProperty({ description: 'Option 3' })
  @Prop({ type: String, required: false })
  option3: string;

  @ApiProperty({ description: 'Option 4' })
  @Prop({ type: String, required: false })
  option4: string;

  @ApiProperty({ description: 'Correct Answer' })
  @Prop({ type: String, required: true })
  correctAnswer: string;

  @ApiProperty({ description: 'Category' })
  @Prop({ type: String, required: false })
  category: string;

  @ApiProperty({ description: 'cadre Type' })
  @Prop({ type: [String], required: true })
  cadreType: string[];

  @ApiProperty({ description: 'Cadre' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: false })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Explanation' })
  @Prop({ type: String, required: false })
  explanation: string;

  @ApiProperty({ description: 'Question Level (Easy,Moderate,difficult)' })
  @Prop({ type: String, required: false })
  qLevel: string;

  @ApiProperty({ description: 'Visible Question Status' })
  @Prop({ type: Boolean, default: true })
  isVisible: boolean;

  @ApiProperty({ description: 'mysql id' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
