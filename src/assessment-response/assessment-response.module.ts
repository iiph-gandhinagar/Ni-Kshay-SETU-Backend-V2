import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { QuestionBankSchema } from 'src/question-bank/entities/question-bank.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { AssessmentResponseController } from './assessment-response.controller';
import { AssessmentResponseService } from './assessment-response.service';
import { AssessmentResponseSchema } from './entities/assessment-response.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'QuestionBank', schema: QuestionBankSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AssessmentResponseController],
  providers: [
    AssessmentResponseService,
    BaseResponse,
    FilterService,
    AdminService,
  ],
  exports: [AssessmentResponseService],
})
export class AssessmentResponseModule {}
