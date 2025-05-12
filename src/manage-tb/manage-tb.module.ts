import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { WatiService } from 'src/common/utils/wati.service';
import { PrescriptionSchema } from 'src/prescription/entities/prescription.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { UploadController } from 'src/upload/upload.controller';
import { ManageTbSchema } from './entities/manage-tb.entity';
import { ManageTbController } from './manage-tb.controller';
import { ManageTbService } from './manage-tb.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ManageTb', schema: ManageTbSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'Prescription', schema: PrescriptionSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [ManageTbController],
  providers: [
    ManageTbService,
    BaseResponse,
    FilterService,
    WatiService,
    EmailService,
    UploadController,
  ],
})
export class ManageTbModule {}
