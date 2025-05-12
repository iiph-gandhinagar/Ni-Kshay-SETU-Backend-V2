import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FeedbackSchema } from 'src/feedback/entities/feedback.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { FeedbackHistorySchema } from './entities/feedback-history.entity';
import { FeedbackHistoryController } from './feedback-history.controller';
import { FeedbackHistoryService } from './feedback-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FeedbackHistory', schema: FeedbackHistorySchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [FeedbackHistoryController],
  providers: [
    FeedbackHistoryService,
    BaseResponse,
    FilterService,
    AdminService,
  ],
})
export class FeedbackHistoryModule {}
