import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticEnquirySchema } from './entities/static-enquiry.entity';
import { StaticEnquiryController } from './static-enquiry.controller';
import { StaticEnquiryService } from './static-enquiry.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticEnquiry', schema: StaticEnquirySchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticEnquiryController],
  providers: [StaticEnquiryService, FilterService, BaseResponse, EmailService],
  exports: [StaticEnquiryService], // for unique value check
})
export class StaticEnquiryModule {}
