import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrimaryCadreSchema } from 'src/primary-cadre/entities/primary-cadre.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { KbaseSchema } from './entities/kbase.entity';
import { KbaseUserHistorySchema } from './entities/kbaseHistory.entity';
import { KbaseController } from './kbase.controller';
import { KbaseService } from './kbase.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Kbase', schema: KbaseSchema }]),
    MongooseModule.forFeature([
      { name: 'Cadre', schema: CadreSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
    ]),
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'PrimaryCadre', schema: PrimaryCadreSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'KbaseUserHistory', schema: KbaseUserHistorySchema },
    ]),
    MongooseModule.forFeature([
      { name: 'subscriberProgressHistory', schema: SubscriberProgressSchema },
    ]),

    forwardRef(() => RolesModule),
  ],
  controllers: [KbaseController],
  providers: [KbaseService, BaseResponse, FilterService],
  exports: [KbaseService],
})
export class KbaseModule {}
