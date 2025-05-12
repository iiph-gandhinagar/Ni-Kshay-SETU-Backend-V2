import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FeedbackHistorySchema } from 'src/feedback-history/entities/feedback-history.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { FeedbackSchema } from './entities/feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'FeedbackHistory', schema: FeedbackHistorySchema },
      { name: 'SubscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FilterService, BaseResponse],
})
export class FeedbackModule {}
