import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticFaqSchema } from './entities/static-faq.entity';
import { StaticFaqController } from './static-faq.controller';
import { StaticFaqService } from './static-faq.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'StaticFaq', schema: StaticFaqSchema }]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticFaqController],
  providers: [StaticFaqService, FilterService, BaseResponse],
  exports: [StaticFaqService],
})
export class StaticFaqModule {}
