import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { HealthFacilitySchema } from './entities/health-facility.entity';
import { HealthFacilityController } from './health-facility.controller';
import { HealthFacilityService } from './health-facility.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'HealthFacility', schema: HealthFacilitySchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [HealthFacilityController],
  providers: [HealthFacilityService, FilterService, BaseResponse, AdminService],
  exports: [HealthFacilityService],
})
export class HealthFacilityModule {}
