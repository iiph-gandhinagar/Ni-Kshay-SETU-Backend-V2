import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { ChatConversionSchema } from 'src/chat-conversion/entities/chat-conversion.entity';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { OldAssessmentResultSchema } from 'src/old-assessment-result/entities/old-assessment-result.entity';
import { ProAssessmentResponseSchema } from 'src/pro-assessment-response/entities/pro-assessment-response.entity';
import { QuerySchema } from 'src/query/entities/query.entity';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'ProAssessmentResponse', schema: ProAssessmentResponseSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'subscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'ChatConversion', schema: ChatConversionSchema },
      { name: 'Query', schema: QuerySchema },
      { name: 'OldAssessmentResult', schema: OldAssessmentResultSchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, FilterService, BaseResponse, EmailService],
  exports: [DashboardService],
})
export class DashboardModule {}
