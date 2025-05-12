import { Module } from '@nestjs/common';
import { SubscriberProgressService } from './subscriber-progress.service';
import { SubscriberProgressController } from './subscriber-progress.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberProgressSchema } from './entities/subscriber-progress-history';
import { SubscriberActivitySchema } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { leaderBoardLevelSchema } from 'src/leader-board/entities/leader-board-level.entity';
import { leaderBoardBadgeSchema } from 'src/leader-board/entities/leader-board-badge.entity';
import { leaderBoardTaskSchema } from 'src/leader-board/entities/leader-board-task.entity';
import { FilterService } from 'src/common/utils/filterService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { SubscriberSchema } from 'src/subscriber/entities/subscriber.entity';
import { AssessmentResponseSchema } from 'src/assessment-response/entities/assessment-response.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'subscriberProgressHistory', schema: SubscriberProgressSchema },
      { name: 'SubscriberActivity', schema: SubscriberActivitySchema },
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
      { name: 'AssessmentResponse', schema: AssessmentResponseSchema },
      { name: 'Subscriber', schema: SubscriberSchema },
    ]),
  ],
  controllers: [SubscriberProgressController],
  providers: [
    SubscriberProgressService,
    BaseResponse,
    FilterService,
    LeaderBoardService,
  ],
})
export class SubscriberProgressModule {}
