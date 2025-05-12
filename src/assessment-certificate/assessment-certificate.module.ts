import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AssessmentCertificateController } from './assessment-certificate.controller';
import { AssessmentCertificateService } from './assessment-certificate.service';
import { AssessmentCertificateSchema } from './entities/assessment-certificate.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentCertificate', schema: AssessmentCertificateSchema },
      { name: 'Assessment', schema: AssessmentSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AssessmentCertificateController],
  providers: [AssessmentCertificateService, BaseResponse, FilterService],
})
export class AssessmentCertificateModule {}
