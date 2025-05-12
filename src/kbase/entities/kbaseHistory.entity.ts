import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the interface for a single module history entry
export class ModuleHistory {
  @Prop({ required: true })
  moduleId: string;

  @Prop({ required: true })
  chapterId: string;

  @Prop({ type: [String], default: [] })
  readContentIds: string[];
}

// Define the interface for the user Kbase history document
export type KbaseUserHistoryDocument = KbaseUserHistory & Document;

// Create the schema for user Kbase history
@Schema({ timestamps: true })
export class KbaseUserHistory {
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Kbase', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, required: true })
  audienceId: string;

  @Prop({ type: [ModuleHistory], default: [] })
  moduleHistory: ModuleHistory[];
}

// Create the schema factory for KbaseUserHistory
export const KbaseUserHistorySchema =
  SchemaFactory.createForClass(KbaseUserHistory);
