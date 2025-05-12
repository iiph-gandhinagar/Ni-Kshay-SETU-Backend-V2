import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FlashSimilarAppSchema } from './entities/flash-similar-app.entity';
import { FlashSimilarAppsController } from './flash-similar-apps.controller';
import { FlashSimilarAppsService } from './flash-similar-apps.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FlashSimilarApp', schema: FlashSimilarAppSchema },
    ]),
  ],
  controllers: [FlashSimilarAppsController],
  providers: [FlashSimilarAppsService, BaseResponse, FilterService],
  exports: [FlashSimilarAppsService],
})
export class FlashSimilarAppsModule {}
