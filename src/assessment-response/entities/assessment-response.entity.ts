import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type AssessmentResponseDocument = AssessmentResponse & Document;
export class History {
  @ApiProperty({ description: 'Question Bank Id' })
  @Prop({ type: Types.ObjectId, ref: 'QuestionBank', required: true })
  questionId: Types.ObjectId;

  @ApiProperty({ description: 'Answer' })
  @Prop({ type: String, required: true })
  answer: string;

  @ApiProperty({ description: 'Is Correct status of question' })
  @Prop({ type: Boolean, required: true })
  isCorrect: boolean;

  @ApiProperty({ description: 'Is Submit status of question' })
  @Prop({ type: Boolean, required: true })
  isSubmit: boolean;

  @ApiProperty({ description: 'Correct answer question' })
  @Prop({ type: String, required: true })
  selectedOption: string;
}
@Schema({ timestamps: true })
export class AssessmentResponse {
  @ApiProperty({ description: 'Assessment Details' })
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Details' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Total marks of an Assessment' })
  @Prop({ type: Number, required: false })
  totalMarks: number;

  @ApiProperty({ description: 'Total Time of an Assessment' })
  @Prop({ type: Number, required: true })
  totalTime: number;

  @ApiProperty({ description: 'Obtained Marks Details' })
  @Prop({ type: Number, required: false, default: 0 })
  obtainedMarks: number;

  @ApiProperty({ description: 'How many Question Attempted' })
  @Prop({ type: Number, required: false, default: 0 })
  attempted: number;

  @ApiProperty({ description: 'How many Right Answers' })
  @Prop({ type: Number, required: false, default: 0 })
  rightAnswer: number;

  @ApiProperty({ description: 'How Many Wrong Answers' })
  @Prop({ type: Number, required: false, default: 0 })
  wrongAnswer: number;

  @ApiProperty({ description: 'How Many Questions skip' })
  @Prop({ type: Number, required: false, default: 0 })
  skip: number;

  @ApiProperty({ description: 'Is marks Calculated' })
  @Prop({ type: Boolean, default: 0 })
  isCalculated: boolean;

  @ApiProperty({ description: 'History of User Assessment Answer' })
  @Prop({ type: [History], required: false })
  history: History[];
}

export const AssessmentResponseSchema =
  SchemaFactory.createForClass(AssessmentResponse);
