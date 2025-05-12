import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
  ],
  controllers: [PdfController],
  providers: [PdfService, BaseResponse],
})
export class PdfModule {}
