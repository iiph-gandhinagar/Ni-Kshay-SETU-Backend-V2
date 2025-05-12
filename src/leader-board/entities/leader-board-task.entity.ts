import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type leaderBoardTaskDocument = leaderBoardTask & Document;

@Schema({ timestamps: true })
export class leaderBoardTask {
  @Prop({ type: Types.ObjectId, ref: 'leaderBoardLevel', required: true })
  levelId: string;

  @Prop({ type: Types.ObjectId, ref: 'leaderBoardBadge', required: true })
  badgeId: string;

  @Prop({ required: true })
  minSpent: number;

  @Prop({ required: true })
  subModuleUsageCount: number;

  @Prop({ required: true })
  chatbotUsageCount: number;

  @Prop({ required: false })
  totalTask: number;

  @Prop({ required: true })
  kbaseCompletion: number;

  @Prop({ required: true })
  appOpenedCount: number;

  @Prop({ required: true })
  correctnessOfAnswers: number;

  @Prop({ required: true })
  totalAssessments: number;
}

// Create the schema factory for leaderBoardTask
export const leaderBoardTaskSchema =
  SchemaFactory.createForClass(leaderBoardTask);
