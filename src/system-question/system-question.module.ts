import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { ChatConversionService } from 'src/chat-conversion/chat-conversion.service';
import { ChatConversionSchema } from 'src/chat-conversion/entities/chat-conversion.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrimaryCadreSchema } from 'src/primary-cadre/entities/primary-cadre.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { SystemQuestionSchema } from './entities/system-question.entity';
import { SystemQuestionController } from './system-question.controller';
import { SystemQuestionService } from './system-question.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SystemQuestion', schema: SystemQuestionSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'ChatConversion', schema: ChatConversionSchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'PrimaryCadre', schema: PrimaryCadreSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [SystemQuestionController],
  providers: [
    SystemQuestionService,
    BaseResponse,
    ChatConversionService,
    FilterService,
  ],
  exports: [SystemQuestionService],
})
export class SystemQuestionModule {}
