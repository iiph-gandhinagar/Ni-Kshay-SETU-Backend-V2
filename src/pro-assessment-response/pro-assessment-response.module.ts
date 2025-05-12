import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { ProAssessmentResponseSchema } from './entities/pro-assessment-response.entity';
import { ProAssessmentResponseController } from './pro-assessment-response.controller';
import { ProAssessmentResponseService } from './pro-assessment-response.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProAssessmentResponse', schema: ProAssessmentResponseSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [ProAssessmentResponseController],
  providers: [
    ProAssessmentResponseService,
    BaseResponse,
    FilterService,
    AdminService,
  ],
  exports: [ProAssessmentResponseService],
})
export class ProAssessmentResponseModule {}
