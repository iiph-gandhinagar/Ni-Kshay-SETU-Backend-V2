import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { MessageNotificationSchema } from './entities/message-notification.entity';
import { MessageNotificationController } from './message-notification.controller';
import { MessageNotificationService } from './message-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MessageNotification', schema: MessageNotificationSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [MessageNotificationController],
  providers: [MessageNotificationService, BaseResponse, FilterService],
  exports: [MessageNotificationService],
})
export class MessageNotificationModule {}
