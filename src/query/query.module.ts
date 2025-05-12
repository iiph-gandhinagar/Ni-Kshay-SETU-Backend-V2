import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { InstituteSchema } from 'src/institute/entities/institute.entity';
import { MasterInstituteSchema } from 'src/master-institute/entities/master-institute.entity';
import { RoleSchema } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { QuerySchema } from './entities/query.entity';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Query', schema: QuerySchema }]),
    MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: 'Institute', schema: InstituteSchema }]),
    MongooseModule.forFeature([
      { name: 'UserNotification', schema: UserNotificationSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'MasterInstitute', schema: MasterInstituteSchema },
    ]),
    forwardRef(() => RolesModule),
    forwardRef(() => UserNotificationModule),
  ],
  controllers: [QueryController],
  providers: [
    QueryService,
    BaseResponse,
    FilterService,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [QueryService],
})
export class QueryModule {}
