import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { ChatConversionSchema } from 'src/chat-conversion/entities/chat-conversion.entity';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { DeleteAccountCountSchema } from 'src/delete-account-count/entities/delete-account-count.entity';
import { FeedbackHistorySchema } from 'src/feedback-history/entities/feedback-history.entity';
import { KbaseUserHistorySchema } from 'src/kbase/entities/kbaseHistory.entity';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { SurveyHistorySchema } from 'src/survey-history/entities/survey-history.entity';
import { UserAppVersionSchema } from 'src/user-app-version/entities/user-app-version.entity';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserDeviceTokenSchema } from './entities/user-device-token.entities';
import { UserDeviceTokenController } from './user-device-token.controller';
import { UserDeviceTokenService } from './user-device-token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'ChatConversion', schema: ChatConversionSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'FeedbackHistory', schema: FeedbackHistorySchema },
      { name: 'KbaseUserHistory', schema: KbaseUserHistorySchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'SubscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'SurveyHistory', schema: SurveyHistorySchema },
      { name: 'UserAppVersion', schema: UserAppVersionSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
      { name: 'DeleteAccountCount', schema: DeleteAccountCountSchema },
    ]),
  ],
  controllers: [UserDeviceTokenController],
  providers: [UserDeviceTokenService, BaseResponse, EmailService],
  exports: [UserDeviceTokenService],
})
export class UserDeviceTokenModule {}
