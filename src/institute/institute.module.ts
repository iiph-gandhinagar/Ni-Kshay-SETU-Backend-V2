import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { MasterInstituteSchema } from 'src/master-institute/entities/master-institute.entity';
import { QuerySchema } from 'src/query/entities/query.entity';
import { RoleSchema } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { InstituteSchema } from './entities/institute.entity';
import { InstituteController } from './institute.controller';
import { InstituteService } from './institute.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Query', schema: QuerySchema }]),
    MongooseModule.forFeature([
      { name: 'Institute', schema: InstituteSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'MasterInstitute', schema: MasterInstituteSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [InstituteController],
  providers: [InstituteService, BaseResponse, FilterService, EmailService],
  exports: [InstituteService],
})
export class InstituteModule {}
