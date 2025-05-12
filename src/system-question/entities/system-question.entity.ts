import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type SystemQuestionDocument = SystemQuestion & Document;

@Schema({ timestamps: true })
export class SystemQuestion {
  @ApiProperty({ description: 'Title of the System Question Tool' })
  @Prop({ type: 'String', required: false })
  title: string;

  @ApiProperty({ description: 'Category of the System Question Tool' })
  @Prop({ type: 'String', required: true })
  category: string;

  @ApiProperty({ description: 'Questions of the System Question Tool' })
  @Prop({ type: [Object], required: false })
  questions: object[];

  @ApiProperty({ description: 'Answers of the System Question Tool' })
  @Prop({ type: [Object], required: false })
  answers: object[];

  @ApiProperty({ description: 'NTEP Id of the System Question Tool' })
  @Prop({ type: Number, required: false })
  NTEPId: number;

  @ApiProperty({ description: 'Active Status of the System Question Tool' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const SystemQuestionSchema =
  SchemaFactory.createForClass(SystemQuestion);
