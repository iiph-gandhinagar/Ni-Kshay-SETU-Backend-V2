import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { AppManagementFlagController } from './app-management-flag.controller';
import { AppManagementFlagService } from './app-management-flag.service';
import { AppManagementSchema } from './entities/app-management-flag.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppManagementFlag', schema: AppManagementSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [AppManagementFlagController],
  providers: [AppManagementFlagService, FilterService, BaseResponse],
  exports: [AppManagementFlagService],
})
export class AppManagementFlagModule {}
