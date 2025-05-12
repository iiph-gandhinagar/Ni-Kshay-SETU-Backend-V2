import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareSchema } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionSchema } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionSchema } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { RolesModule } from 'src/roles/roles.module';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationSchema } from 'src/user-notification/entities/user-notification.entity';
import { AlgorithmCgcInterventionController } from './algorithm-cgc-intervention.controller';
import { AlgorithmCgcInterventionService } from './algorithm-cgc-intervention.service';
import { AlgorithmCgcInterventionSchema } from './entities/algorithm-cgc-intervention.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AlgorithmCgcIntervention',
        schema: AlgorithmCgcInterventionSchema,
      },
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
      {
        name: 'AlgorithmDifferentialCare',
        schema: AlgorithmDifferentialCareSchema,
      },
      {
        name: 'AlgorithmGuidanceOnAdverseDrugReaction',
        schema: AlgorithmGuidanceOnAdverseDrugReactionSchema,
      },
      { name: 'AlgorithmTreatment', schema: AlgorithmTreatmentSchema },
      {
        name: 'AlgorithmLatentTbInfection',
        schema: AlgorithmLatentTbInfectionSchema,
      },
      { name: 'State', schema: StateSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
      { name: 'UserNotification', schema: UserNotificationSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AlgorithmCgcInterventionController],
  providers: [
    AlgorithmCgcInterventionService,
    BaseResponse,
    FilterService,
    LanguageTranslation,
    FirebaseService,
    NotificationQueueService,
  ],
  exports: [AlgorithmCgcInterventionService],
})
export class AlgorithmCgcInterventionModule {}
