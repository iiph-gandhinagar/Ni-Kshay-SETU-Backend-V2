import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { EmailService } from 'src/common/mail/email.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { InquirySchema } from './entities/inquiry.entity';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Inquiry', schema: InquirySchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [InquiryController],
  providers: [
    InquiryService,
    BaseResponse,
    FilterService,
    AdminService,
    EmailService,
  ],
  exports: [InquiryService],
})
export class InquiryModule {}
