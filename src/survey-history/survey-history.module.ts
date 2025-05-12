import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SurveyHistorySchema } from './entities/survey-history.entity';
import { SurveyHistoryController } from './survey-history.controller';
import { SurveyHistoryService } from './survey-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SurveyHistory', schema: SurveyHistorySchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [SurveyHistoryController],
  providers: [SurveyHistoryService, BaseResponse, FilterService, AdminService],
  exports: [SurveyHistoryService],
})
export class SurveyHistoryModule {}
