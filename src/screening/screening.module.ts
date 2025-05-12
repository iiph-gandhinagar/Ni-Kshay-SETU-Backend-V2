import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmDiagnosisSchema } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmTreatmentSchema } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { BlockSchema } from 'src/block/entities/block.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { CountrySchema } from 'src/country/entities/country.entity';
import { DistrictSchema } from 'src/district/entities/district.entity';
import { HealthFacilitySchema } from 'src/health-facility/entities/health-facility.entity';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { SymptomSchema } from 'src/symptom/entities/symptom.entity';
import { ScreeningSchema } from './entities/screening.entity';
import { ScreeningController } from './screening.controller';
import { ScreeningService } from './screening.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Screening', schema: ScreeningSchema }]),
    MongooseModule.forFeature([{ name: 'Symptom', schema: SymptomSchema }]),
    MongooseModule.forFeature([{ name: 'Country', schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: 'State', schema: StateSchema }]),
    MongooseModule.forFeature([{ name: 'District', schema: DistrictSchema }]),
    MongooseModule.forFeature([{ name: 'Block', schema: BlockSchema }]),
    MongooseModule.forFeature([{ name: 'Cadre', schema: CadreSchema }]),
    MongooseModule.forFeature([
      { name: 'AlgorithmTreatment', schema: AlgorithmTreatmentSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'AlgorithmDiagnosis', schema: AlgorithmDiagnosisSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'HealthFacility', schema: HealthFacilitySchema },
    ]),
  ],
  controllers: [ScreeningController],
  providers: [ScreeningService, BaseResponse],
  exports: [ScreeningService],
})
export class ScreeningModule {}
