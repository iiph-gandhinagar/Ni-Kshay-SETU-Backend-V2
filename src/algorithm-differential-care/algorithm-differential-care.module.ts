import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmCgcInterventionSchema } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionSchema } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionSchema } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { RolesModule } from 'src/roles/roles.module';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { AlgorithmDifferentialCareController } from './algorithm-differential-care.controller';
import { AlgorithmDifferentialCareService } from './algorithm-differential-care.service';
import { AlgorithmDifferentialCareSchema } from './entities/algorithm-differential-care.entity';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AlgorithmDifferentialCare',
        schema: AlgorithmDifferentialCareSchema,
      },
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
      {
        name: 'AlgorithmGuidanceOnAdverseDrugReaction',
        schema: AlgorithmGuidanceOnAdverseDrugReactionSchema,
      },
      { name: 'AlgorithmTreatment', schema: AlgorithmTreatmentSchema },
      {
        name: 'AlgorithmLatentTbInfection',
        schema: AlgorithmLatentTbInfectionSchema,
      },
      {
        name: 'AlgorithmCgcIntervention',
        schema: AlgorithmCgcInterventionSchema,
      },
      { name: 'State', schema: StateSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
    ]),
    forwardRef(() => RolesModule),
    forwardRef(() => UserNotificationModule),
  ],
  controllers: [AlgorithmDifferentialCareController],
  providers: [
    AlgorithmDifferentialCareService,
    BaseResponse,
    FilterService,
    LanguageTranslation,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [AlgorithmDifferentialCareService],
})
export class AlgorithmDifferentialCareModule {}
