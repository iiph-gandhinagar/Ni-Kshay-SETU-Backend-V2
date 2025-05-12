import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type SurveyHistoryDocument = SurveyHistory & Document;

@Schema({ timestamps: true })
export class SurveyHistory {
  @ApiProperty({ description: 'User Id of Survey History' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'User Id of Survey History' })
  @Prop({ type: Types.ObjectId, ref: 'SurveyMaster', required: true })
  surveyId: Types.ObjectId;

  @ApiProperty({ description: 'Question Answer Details of Survey History' })
  @Prop({
    type: [
      {
        surveyQuestionId: {
          type: Types.ObjectId,
          ref: 'SurveyMaster',
          required: true,
        },
        answer: { type: String, required: true },
      },
    ],
    required: true,
  })
  questionAnswer: {
    surveyQuestionId: Types.ObjectId;
    answer: string;
  }[];
}

export const SurveyHistorySchema = SchemaFactory.createForClass(SurveyHistory);

SurveyHistorySchema.virtual('questionAnswerDetails', {
  ref: 'SurveyMaster',
  localField: 'questionAnswer.surveyQuestionId', // The field in SurveyHistory
  foreignField: 'questions._id', // The field in SurveyMaster.questions
  justOne: true, // Multiple matches since it's an array,
});
