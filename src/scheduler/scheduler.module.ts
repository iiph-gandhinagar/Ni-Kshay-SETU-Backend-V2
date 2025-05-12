import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { All3rdPartyApisResponseSchema } from 'src/all-3rd-party-apis-response/entities/all-3rd-party-apis-response.entity';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { leaderBoardBadgeSchema } from 'src/leader-board/entities/leader-board-badge.entity';
import { leaderBoardLevelSchema } from 'src/leader-board/entities/leader-board-level.entity';
import { leaderBoardTaskSchema } from 'src/leader-board/entities/leader-board-task.entity';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { NotificationSchedulerService } from './notificationScheduler.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
      { name: 'SubscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      {
        name: 'All3rdPartyApisResponse',
        schema: All3rdPartyApisResponseSchema,
      },
    ]),
    forwardRef(() => UserNotificationModule),
  ],
  providers: [
    NotificationSchedulerService,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [NotificationSchedulerService],
})
export class SchedulerModule {}
