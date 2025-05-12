// subscriber-progress-history.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Document, Types } from 'mongoose';

class ActionCount {
  @ApiProperty({ example: 'appOpenedCount', description: 'Action name' })
  @IsString()
  action: string;

  @ApiProperty({ example: 20, description: 'Count of the action' })
  @IsNumber()
  count: number;
}

class HistoryEntry {
  @ApiProperty({
    example: 'Proficient',
    description: 'Level of the subscriber',
  })
  @IsString()
  level: string;

  @ApiProperty({
    example: 'Gold',
    description: 'Badge awarded to the subscriber',
  })
  @IsString()
  badge_name: string;

  @ApiProperty({
    description: 'Array of actions with counts',
    type: [ActionCount],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionCount)
  actions: ActionCount[];

  @ApiProperty({ description: 'Timestamp when the level was completed' })
  @IsDate()
  @Prop({ default: Date.now })
  timestamp: Date;
}
export type SubscriberProgressHistoryDocument = SubscriberProgressHistory &
  Document;
@Schema({ timestamps: true })
export class SubscriberProgressHistory {
  @ApiProperty({ description: 'User ID' })
  @Prop({
    type: Types.ObjectId,
    ref: 'Subscriber',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Level Id' })
  @Prop({ type: Types.ObjectId, ref: 'leaderBoardLevel', required: true })
  levelId: Types.ObjectId;

  @ApiProperty({ description: 'Badge Id' })
  @Prop({ type: Types.ObjectId, ref: 'leaderBoardBadge', required: false })
  badgeId: Types.ObjectId;

  @ApiProperty({ description: 'App opened count' })
  @IsNumber()
  @Prop({ default: 0 })
  appOpenedCount: number;

  @ApiProperty({ description: 'Minutes spent in the app' })
  @IsNumber()
  @Prop({ default: 0 })
  minSpent: number;

  @ApiProperty({ description: 'Correctness of answers (%)' })
  @IsNumber()
  @Prop({ default: 0 })
  correctnessOfAnswers: number;

  @ApiProperty({ description: 'Sub-module usage count' })
  @IsNumber()
  @Prop({ default: 0 })
  subModuleUsageCount: number;

  @ApiProperty({ description: 'Chatbot usage count' })
  @IsNumber()
  @Prop({ default: 0 })
  chatbotUsageCount: number;

  @ApiProperty({ description: 'Knowledge base completion (%)' })
  @IsNumber()
  @Prop({ default: 0 })
  kbaseCompletion: number;

  @ApiProperty({ description: 'Knowledge base completion (%)' })
  @IsOptional()
  @IsNumber()
  @Prop({ default: 0 })
  taskCompleted: number;

  @ApiProperty({ description: 'tota lAssessments count' })
  @IsOptional()
  @IsNumber()
  @Prop({ default: 0 })
  totalAssessments: number;

  @ApiProperty({
    type: [HistoryEntry],
    description: 'History of subscriber progress over time',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryEntry)
  @Prop({ type: [HistoryEntry], default: [] })
  subscriberHistory: HistoryEntry[];
}

export const SubscriberProgressSchema = SchemaFactory.createForClass(
  SubscriberProgressHistory,
);
