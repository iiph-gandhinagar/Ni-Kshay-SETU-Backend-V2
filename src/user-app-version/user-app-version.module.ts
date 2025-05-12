import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { UserAppVersionSchema } from './entities/user-app-version.entity';
import { UserAppVersionController } from './user-app-version.controller';
import { UserAppVersionService } from './user-app-version.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserAppVersion', schema: UserAppVersionSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [UserAppVersionController],
  providers: [UserAppVersionService, BaseResponse, FilterService],
  exports: [UserAppVersionService],
})
export class UserAppVersionModule {}
