import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { InstituteSchema } from 'src/institute/entities/institute.entity';
import { RoleSchema } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { MasterInstituteSchema } from './entities/master-institute.entity';
import { MasterInstituteController } from './master-institute.controller';
import { MasterInstituteService } from './master-institute.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MasterInstitute', schema: MasterInstituteSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'Institute', schema: InstituteSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [MasterInstituteController],
  providers: [MasterInstituteService, BaseResponse, FilterService],
  exports: [MasterInstituteService],
})
export class MasterInstituteModule {}
