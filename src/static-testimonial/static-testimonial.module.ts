import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticTestimonialSchema } from './entities/static-testimonial.entity';
import { StaticTestimonialController } from './static-testimonial.controller';
import { StaticTestimonialService } from './static-testimonial.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticTestimonial', schema: StaticTestimonialSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticTestimonialController],
  providers: [StaticTestimonialService, FilterService, BaseResponse],
  exports: [StaticTestimonialService],
})
export class StaticTestimonialModule {}
