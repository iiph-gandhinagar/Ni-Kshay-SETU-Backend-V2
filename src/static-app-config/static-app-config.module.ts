import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticAppConfigSchema } from './entities/static-app-config.entity';
import { StaticAppConfigController } from './static-app-config.controller';
import { StaticAppConfigService } from './static-app-config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticAppConfig', schema: StaticAppConfigSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticAppConfigController],
  providers: [StaticAppConfigService, FilterService, BaseResponse],
  exports: [StaticAppConfigService],
})
export class StaticAppConfigModule {}
