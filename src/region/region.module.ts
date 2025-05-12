import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmCgcInterventionSchema } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareSchema } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionSchema } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionSchema } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
import { BlockSchema } from 'src/block/entities/block.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { CountrySchema } from 'src/country/entities/country.entity';
import { DistrictSchema } from 'src/district/entities/district.entity';
import { FlashNewsSchema } from 'src/flash-news/entities/flash-new.entity';
import { FlashSimilarAppSchema } from 'src/flash-similar-apps/entities/flash-similar-app.entity';
import { HealthFacilitySchema } from 'src/health-facility/entities/health-facility.entity';
import { PluginManagementSchema } from 'src/plugin-management/entities/plugin-management.entity';
import { PrimaryCadreSchema } from 'src/primary-cadre/entities/primary-cadre.entity';
import { ResourceMaterialSchema } from 'src/resource-material/entities/resource-material.entity';
import { RoleSchema } from 'src/roles/entities/role.entity';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'State', schema: StateSchema },
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'District', schema: DistrictSchema },
      { name: 'Block', schema: BlockSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'Country', schema: CountrySchema },
      { name: 'HealthFacility', schema: HealthFacilitySchema },
      { name: 'FlashSimilarApp', schema: FlashSimilarAppSchema },
      { name: 'FlashNews', schema: FlashNewsSchema },
      { name: 'PluginManagement', schema: PluginManagementSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AlgorithmTreatment', schema: AlgorithmTreatmentSchema },
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
      { name: 'PrimaryCadre', schema: PrimaryCadreSchema },
      { name: 'ResourceMaterial', schema: ResourceMaterialSchema },
      {
        name: 'AlgorithmLatentTbInfection',
        schema: AlgorithmLatentTbInfectionSchema,
      },
      {
        name: 'AlgorithmGuidanceOnAdverseDrugReaction',
        schema: AlgorithmGuidanceOnAdverseDrugReactionSchema,
      },
      {
        name: 'AlgorithmDifferentialCare',
        schema: AlgorithmDifferentialCareSchema,
      },
      {
        name: 'AlgorithmCgcIntervention',
        schema: AlgorithmCgcInterventionSchema,
      },
    ]),
  ],
  controllers: [RegionController],
  providers: [RegionService, BaseResponse],
})
export class RegionModule {}
