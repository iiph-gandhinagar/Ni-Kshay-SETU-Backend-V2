import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { BaseResponse } from './../common/utils/baseResponse';
import { ChatConversionController } from './chat-conversion.controller';
import { ChatConversionService } from './chat-conversion.service';
import { ChatConversionSchema } from './entities/chat-conversion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ChatConversion', schema: ChatConversionSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [ChatConversionController],
  providers: [ChatConversionService, BaseResponse, FilterService, AdminService],
  exports: [ChatConversionService],
})
export class ChatConversionModule {}
