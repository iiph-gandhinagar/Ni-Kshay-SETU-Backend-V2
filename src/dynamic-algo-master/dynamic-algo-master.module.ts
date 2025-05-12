import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { DynamicAlgoMasterController } from './dynamic-algo-master.controller';
import { DynamicAlgoMasterService } from './dynamic-algo-master.service';
import { DynamicAlgoMasterSchema } from './entities/dynamic-algo-master.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DynamicAlgoMaster', schema: DynamicAlgoMasterSchema },
    ]),
  ],
  controllers: [DynamicAlgoMasterController],
  providers: [
    DynamicAlgoMasterService,
    BaseResponse,
    FilterService,
    LanguageTranslation,
  ],
  exports: [DynamicAlgoMasterService],
})
export class DynamicAlgoMasterModule {}
