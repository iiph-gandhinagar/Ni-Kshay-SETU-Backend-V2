import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticTestimonialSchema } from 'src/static-testimonial/entities/static-testimonial.entity';
import { StaticWhatWeDoSchema } from 'src/static-what-we-do/entities/static-what-we-do.entity';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { StaticKeyFeatureSchema } from './entities/static-key-feature.entity';
import { StaticKeyFeatureController } from './static-key-feature.controller';
import { StaticKeyFeatureService } from './static-key-feature.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticKeyFeature', schema: StaticKeyFeatureSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'StaticTestimonial', schema: StaticTestimonialSchema },
      { name: 'StaticWhatWeDo', schema: StaticWhatWeDoSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticKeyFeatureController],
  providers: [StaticKeyFeatureService, FilterService, BaseResponse],
  exports: [StaticKeyFeatureService],
})
export class StaticKeyFeatureModule {}
