import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { SurveyHistorySchema } from 'src/survey-history/entities/survey-history.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { SurveyMasterSchema } from './entities/survey-master.entity';
import { SurveyMasterController } from './survey-master.controller';
import { SurveyMasterService } from './survey-master.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SurveyMaster', schema: SurveyMasterSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'SurveyHistory', schema: SurveyHistorySchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
    ]),
    forwardRef(() => RolesModule),
    forwardRef(() => UserNotificationModule),
  ],
  controllers: [SurveyMasterController],
  providers: [
    SurveyMasterService,
    BaseResponse,
    FilterService,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [SurveyMasterService],
})
export class SurveyMasterModule {}
