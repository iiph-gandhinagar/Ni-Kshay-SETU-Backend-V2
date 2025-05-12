import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentSchema } from 'src/assessment/entities/assessment.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { QuestionBankSchema } from './entities/question-bank.entity';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'QuestionBank', schema: QuestionBankSchema },
      { name: 'Assessment', schema: AssessmentSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [QuestionBankController],
  providers: [QuestionBankService, BaseResponse, FilterService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}
