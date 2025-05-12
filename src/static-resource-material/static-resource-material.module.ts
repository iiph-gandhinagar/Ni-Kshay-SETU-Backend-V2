import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { StaticResourceMaterialSchema } from './entities/static-resource-material.entity';
import { StaticResourceMaterialController } from './static-resource-material.controller';
import { StaticResourceMaterialService } from './static-resource-material.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StaticResourceMaterial', schema: StaticResourceMaterialSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [StaticResourceMaterialController],
  providers: [StaticResourceMaterialService, BaseResponse, FilterService],
  exports: [StaticResourceMaterialService],
})
export class StaticResourceMaterialModule {}
