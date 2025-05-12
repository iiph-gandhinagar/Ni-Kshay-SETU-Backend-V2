import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesModule } from 'src/roles/roles.module';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { BlockSchema } from './entities/block.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Block', schema: BlockSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [BlockController],
  providers: [BlockService, FilterService, BaseResponse, AdminService],
  exports: [BlockService],
})
export class BlockModule {}
