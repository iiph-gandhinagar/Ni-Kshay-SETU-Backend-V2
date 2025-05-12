import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { AbbreviationController } from './abbreviation.controller';
import { AbbreviationService } from './abbreviation.service';
import { AbbreviationSchema } from './entities/abbreviation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Abbreviation', schema: AbbreviationSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AbbreviationController],
  providers: [AbbreviationService, BaseResponse, FilterService],
  exports: [AbbreviationService],
})
export class AbbreviationModule {}
