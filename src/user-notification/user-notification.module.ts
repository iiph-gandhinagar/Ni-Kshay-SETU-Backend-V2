import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareSchema } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionSchema } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionSchema } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
// import { AutomaticNotificationSchema } from 'src/automatic-notification/entities/automatic-notification.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { ResourceMaterialSchema } from 'src/resource-material/entities/resource-material.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from './entities/user-notification.entity';
import { UserNotificationController } from './user-notification.controller';
import { UserNotificationService } from './user-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserNotification', schema: UserNotificationSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'ResourceMaterial', schema: ResourceMaterialSchema },
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
      { name: 'AlgorithmTreatment', schema: AlgorithmTreatmentSchema },
      {
        name: 'AlgorithmDifferentialCare',
        schema: AlgorithmDifferentialCareSchema,
      },
      {
        name: 'AlgorithmGuidanceOnAdverseDrugReaction',
        schema: AlgorithmGuidanceOnAdverseDrugReactionSchema,
      },
      {
        name: 'AlgorithmLatentTbInfection',
        schema: AlgorithmLatentTbInfectionSchema,
      },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [UserNotificationController],
  providers: [
    UserNotificationService,
    BaseResponse,
    FilterService,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [UserNotificationService],
})
export class UserNotificationModule {}
