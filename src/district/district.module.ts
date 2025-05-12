import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { DistrictController } from './district.controller';
import { DistrictService } from './district.service';
import { DistrictSchema } from './entities/district.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'District', schema: DistrictSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [DistrictController],
  providers: [DistrictService, FilterService, AdminService, BaseResponse],
  exports: [DistrictService],
})
export class DistrictModule {}
