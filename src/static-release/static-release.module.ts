import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticReleaseSchema } from './entities/static-release.entity';
import { StaticReleaseController } from './static-release.controller';
import { StaticReleaseService } from './static-release.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticRelease', schema: StaticReleaseSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticReleaseController],
  providers: [StaticReleaseService, FilterService, BaseResponse],
  exports: [StaticReleaseService],
})
export class StaticReleaseModule {}
