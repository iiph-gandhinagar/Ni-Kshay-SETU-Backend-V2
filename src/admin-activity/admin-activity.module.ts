import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AdminActivityController } from './admin-activity.controller';
import { AdminActivityService } from './admin-activity.service';
import { AdminActivitySchema } from './entities/admin-activity.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AdminActivity', schema: AdminActivitySchema },
    ]),
  ],
  controllers: [AdminActivityController],
  providers: [AdminActivityService, BaseResponse, FilterService],
  exports: [AdminActivityService],
})
export class AdminActivityModule {}
