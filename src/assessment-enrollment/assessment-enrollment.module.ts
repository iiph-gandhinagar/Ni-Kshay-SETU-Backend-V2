import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AssessmentEnrollmentController } from './assessment-enrollment.controller';
import { AssessmentEnrollmentService } from './assessment-enrollment.service';
import { AssessmentEnrollmentSchema } from './entities/assessment-enrollment.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentEnrollment', schema: AssessmentEnrollmentSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AssessmentEnrollmentController],
  providers: [AssessmentEnrollmentService, BaseResponse, FilterService],
  exports: [AssessmentEnrollmentService],
})
export class AssessmentEnrollmentModule {}
