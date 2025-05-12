import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type leaderBoardBadgeDocument = leaderBoardBadge & Document;

@Schema({ timestamps: true })
export class leaderBoardBadge {
  @Prop({ required: true })
  badge: string;

  @Prop({ type: Types.ObjectId, ref: 'leaderBoardLevel', required: true })
  levelId: string;

  @Prop({ required: true })
  index: number;
}

// Create the schema factory for leaderBoardBadge
export const leaderBoardBadgeSchema =
  SchemaFactory.createForClass(leaderBoardBadge);
