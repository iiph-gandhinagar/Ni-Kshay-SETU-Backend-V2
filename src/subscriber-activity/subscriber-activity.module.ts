import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmCgcInterventionSchema } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareSchema } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionSchema } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionSchema } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { BlockSchema } from 'src/block/entities/block.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CountrySchema } from 'src/country/entities/country.entity';
import { DistrictSchema } from 'src/district/entities/district.entity';
import { HealthFacilitySchema } from 'src/health-facility/entities/health-facility.entity';
import { leaderBoardBadgeSchema } from 'src/leader-board/entities/leader-board-badge.entity';
import { leaderBoardLevelSchema } from 'src/leader-board/entities/leader-board-level.entity';
import { leaderBoardTaskSchema } from 'src/leader-board/entities/leader-board-task.entity';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UserAppVersionSchema } from 'src/user-app-version/entities/user-app-version.entity';
import { SubscriberActivitySchema } from './entities/subscriber-activity.entity';
import { SubscriberActivityController } from './subscriber-activity.controller';
import { SubscriberActivityService } from './subscriber-activity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'UserAppVersion', schema: UserAppVersionSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'State', schema: StateSchema },
      { name: 'Country', schema: CountrySchema },
      { name: 'District', schema: DistrictSchema },
      { name: 'Block', schema: BlockSchema },
      { name: 'HealthFacility', schema: HealthFacilitySchema },
      { name: 'Cadre', schema: CadreSchema },
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
      {
        name: 'AlgorithmCgcIntervention',
        schema: AlgorithmCgcInterventionSchema,
      },
    ]),
  ],
  controllers: [SubscriberActivityController],
  providers: [
    SubscriberActivityService,
    BaseResponse,
    FilterService,
    LeaderBoardService,
    AdminService,
  ],
  exports: [SubscriberActivityService],
})
export class SubscriberActivityModule {}
