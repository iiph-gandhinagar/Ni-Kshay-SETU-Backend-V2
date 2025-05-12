import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { MasterCmSchema } from './entities/master-cm.entity';
import { MasterCmsController } from './master-cms.controller';
import { MasterCmsService } from './master-cms.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'MasterCm', schema: MasterCmSchema }]),
  ],
  controllers: [MasterCmsController],
  providers: [MasterCmsService, BaseResponse, FilterService],
  exports: [MasterCmsService],
})
export class MasterCmsModule {}
