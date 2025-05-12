import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type leaderBoardLevelDocument = leaderBoardLevel & Document;

@Schema({ timestamps: true })
export class leaderBoardLevel {
  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  index: number;
}

// Create the schema factory for leaderBoardLevel
export const leaderBoardLevelSchema =
  SchemaFactory.createForClass(leaderBoardLevel);
