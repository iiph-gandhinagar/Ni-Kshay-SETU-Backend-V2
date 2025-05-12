import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { RolesModule } from 'src/roles/roles.module';
import { SymptomSchema } from './entities/symptom.entity';
import { SymptomController } from './symptom.controller';
import { SymptomService } from './symptom.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Symptom', schema: SymptomSchema }]),
    forwardRef(() => RolesModule),
  ],
  controllers: [SymptomController],
  providers: [
    SymptomService,
    FilterService,
    BaseResponse,
    EmailService,
    LanguageTranslation,
  ],
  exports: [SymptomService],
})
export class SymptomModule {}
