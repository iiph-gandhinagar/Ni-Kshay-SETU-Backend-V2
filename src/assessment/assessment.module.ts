import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AssessmentEnrollmentSchema } from 'src/assessment-enrollment/entities/assessment-enrollment.entity';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { CountrySchema } from 'src/country/entities/country.entity';
import { DistrictSchema } from 'src/district/entities/district.entity';
import { PrimaryCadreSchema } from 'src/primary-cadre/entities/primary-cadre.entity';
import { QuestionBankSchema } from 'src/question-bank/entities/question-bank.entity';
import { RolesModule } from 'src/roles/roles.module';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AssessmentSchema } from './entities/assessment.entity';
import { OldAssessmentResultSchema } from 'src/old-assessment-result/entities/old-assessment-result.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'QuestionBank', schema: QuestionBankSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'AssessmentEnrollment', schema: AssessmentEnrollmentSchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'State', schema: StateSchema },
      { name: 'Country', schema: CountrySchema },
      { name: 'District', schema: DistrictSchema },
      { name: 'PrimaryCadre', schema: PrimaryCadreSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'OldAssessmentResult', schema: OldAssessmentResultSchema },
    ]),
    forwardRef(() => RolesModule),
    forwardRef(() => UserNotificationModule),
  ],
  controllers: [AssessmentController],
  providers: [
    AssessmentService,
    BaseResponse,
    FilterService,
    FirebaseService,
    NotificationQueueService,
    AdminService,
  ],
  exports: [AssessmentService],
})
export class AssessmentModule {}
