import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { DynamicAlgorithmController } from './dynamic-algorithm.controller';
import { DynamicAlgorithmService } from './dynamic-algorithm.service';
import { DynamicAlgorithmSchema } from './entities/dynamic-algorithm.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DynamicAlgorithm', schema: DynamicAlgorithmSchema },
      { name: 'State', schema: StateSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
  ],
  controllers: [DynamicAlgorithmController],
  providers: [DynamicAlgorithmService, BaseResponse, FilterService],
  exports: [DynamicAlgorithmService],
})
export class DynamicAlgorithmModule {}
