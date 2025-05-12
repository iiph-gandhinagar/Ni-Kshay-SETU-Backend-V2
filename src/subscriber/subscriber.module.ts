import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserSchema } from 'src/admin-users/entities/admin-user.entity';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';
import { BlockSchema } from 'src/block/entities/block.entity';
import { CadreSchema } from 'src/cadre/entities/cadre.entity';
import { EmailService } from 'src/common/mail/email.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CountrySchema } from 'src/country/entities/country.entity';
import { DistrictSchema } from 'src/district/entities/district.entity';
import { HealthFacilitySchema } from 'src/health-facility/entities/health-facility.entity';
import { InstituteSchema } from 'src/institute/entities/institute.entity';
import { IpBlockerModule } from 'src/ipBlocker/ipBlocker.module';
import { leaderBoardBadgeSchema } from 'src/leader-board/entities/leader-board-badge.entity';
import { leaderBoardLevelSchema } from 'src/leader-board/entities/leader-board-level.entity';
import { leaderBoardTaskSchema } from 'src/leader-board/entities/leader-board-task.entity';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { RolesModule } from 'src/roles/roles.module';
import { StateSchema } from 'src/state/entities/state.entity';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressSchema } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberProgressService } from 'src/subscriber-progress/subscriber-progress.service';
import { SubscriberSchema } from './entities/subscriber.entity';
import { SubscriberController } from './subscriber.controller';
import { SubscriberService } from './subscriber.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subscriber', schema: SubscriberSchema },
      { name: 'Institute', schema: InstituteSchema },
      { name: 'subscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      { name: 'State', schema: StateSchema },
      { name: 'Country', schema: CountrySchema },
      { name: 'District', schema: DistrictSchema },
      { name: 'Block', schema: BlockSchema },
      { name: 'HealthFacility', schema: HealthFacilitySchema },
      { name: 'Cadre', schema: CadreSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'AdminUser', schema: AdminUserSchema },
    ]),
    forwardRef(() => RolesModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRY || '365d' },
    }),
    forwardRef(() => IpBlockerModule),
  ],
  controllers: [SubscriberController],
  providers: [
    SubscriberService,
    FilterService,
    BaseResponse,
    EmailService,
    SubscriberProgressService,
    LeaderBoardService,
    AdminService,
  ],
  exports: [SubscriberService],
})
export class SubscriberModule {}
