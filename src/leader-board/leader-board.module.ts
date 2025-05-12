import { forwardRef, Module } from '@nestjs/common';
import { LeaderBoardService } from './leader-board.service';
import { LeaderBoardController } from './leader-board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { leaderBoardLevelSchema } from './entities/leader-board-level.entity';
import { FilterService } from 'src/common/utils/filterService';
import { leaderBoardBadgeSchema } from './entities/leader-board-badge.entity';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { leaderBoardTaskSchema } from './entities/leader-board-task.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'leaderBoardLevel', schema: leaderBoardLevelSchema },
      { name: 'leaderBoardBadge', schema: leaderBoardBadgeSchema },
      { name: 'leaderBoardTask', schema: leaderBoardTaskSchema },
    ]),
    forwardRef(() => RolesModule),
  ],
  controllers: [LeaderBoardController],
  providers: [LeaderBoardService, BaseResponse, FilterService],
  exports: [LeaderBoardService],
})
export class LeaderBoardModule {}
