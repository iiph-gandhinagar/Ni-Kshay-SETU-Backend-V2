import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { OldAssessmentResultSchema } from './entities/old-assessment-result.entity';
import { OldAssessmentResultController } from './old-assessment-result.controller';
import { OldAssessmentResultService } from './old-assessment-result.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'OldAssessmentResult', schema: OldAssessmentResultSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [OldAssessmentResultController],
  providers: [
    OldAssessmentResultService,
    FilterService,
    BaseResponse,
    AdminService,
  ],
  exports: [OldAssessmentResultService],
})
export class OldAssessmentResultModule {}
