import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticWhatWeDoSchema } from './entities/static-what-we-do.entity';
import { StaticWhatWeDoController } from './static-what-we-do.controller';
import { StaticWhatWeDoService } from './static-what-we-do.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticWhatWeDo', schema: StaticWhatWeDoSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticWhatWeDoController],
  providers: [StaticWhatWeDoService, FilterService, BaseResponse],
  exports: [StaticWhatWeDoService],
})
export class StaticWhatWeDoModule {}
