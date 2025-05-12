import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FlashNewsSchema } from './entities/flash-new.entity';
import { FlashNewsController } from './flash-news.controller';
import { FlashNewsService } from './flash-news.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FlashNews', schema: FlashNewsSchema }]),
  ],
  controllers: [FlashNewsController],
  providers: [FlashNewsService, BaseResponse, FilterService],
  exports: [FlashNewsService],
})
export class FlashNewsModule {}
