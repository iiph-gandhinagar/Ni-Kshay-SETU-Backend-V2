import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { StateSchema } from './entities/state.entity';
import { StateController } from './state.controller';
import { StateService } from './state.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'State', schema: StateSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StateController],
  providers: [StateService, FilterService, BaseResponse, AdminService],
  exports: [StateService],
})
export class StateModule {}
