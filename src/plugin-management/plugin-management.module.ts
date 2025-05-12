import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PluginManagementSchema } from './entities/plugin-management.entity';
import { PluginManagementController } from './plugin-management.controller';
import { PluginManagementService } from './plugin-management.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PluginManagement', schema: PluginManagementSchema },
    ]),
  ],
  controllers: [PluginManagementController],
  providers: [PluginManagementService, BaseResponse, FilterService],
  exports: [PluginManagementService],
})
export class PluginManagementModule {}
