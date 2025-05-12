import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RoleSchema } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Role', schema: RoleSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService, FilterService, BaseResponse],
  exports: [RolesService],
})
export class RolesModule {}
