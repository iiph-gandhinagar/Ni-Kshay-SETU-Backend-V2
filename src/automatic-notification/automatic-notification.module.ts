import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { AutomaticNotificationController } from './automatic-notification.controller';
import { AutomaticNotificationService } from './automatic-notification.service';
import { AutomaticNotificationSchema } from './entities/automatic-notification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AutomaticNotification', schema: AutomaticNotificationSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AutomaticNotificationController],
  providers: [AutomaticNotificationService, BaseResponse, FilterService],
  exports: [AutomaticNotificationService],
})
export class AutomaticNotificationModule {}
