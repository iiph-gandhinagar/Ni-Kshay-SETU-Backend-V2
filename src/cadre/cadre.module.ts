import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { CadreController } from './cadre.controller';
import { CadreService } from './cadre.service';
import { CadreSchema } from './entities/cadre.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Cadre', schema: CadreSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [CadreController],
  providers: [CadreService, FilterService, BaseResponse],
  exports: [CadreService],
})
export class CadreModule {}
