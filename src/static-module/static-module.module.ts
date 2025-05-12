import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticModuleSchema } from './entities/static-module.entity';
import { StaticModuleController } from './static-module.controller';
import { StaticModuleService } from './static-module.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticModule', schema: StaticModuleSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticModuleController],
  providers: [StaticModuleService, FilterService, BaseResponse],
  exports: [StaticModuleService],
})
export class StaticModuleModule {}
