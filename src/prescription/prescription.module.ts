import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { PrescriptionSchema } from './entities/prescription.entity';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Prescription', schema: PrescriptionSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, FilterService, BaseResponse],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
