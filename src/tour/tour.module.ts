import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { TourSchema } from './entities/tour.entity';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tour', schema: TourSchema }]),
    forwardRef(() => RolesModule),
  ],
  controllers: [TourController],
  providers: [TourService, BaseResponse, FilterService],
  exports: [TourService],
})
export class TourModule {}
