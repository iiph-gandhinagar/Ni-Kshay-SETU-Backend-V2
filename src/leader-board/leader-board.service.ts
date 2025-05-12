import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import {
  CreateBadgeDto,
  CreateLeaderBoardLevelDto,
  CreateTaskDto,
  UpdateLeaderBoardLevelDto,
  UpdateTaskDto,
} from './dto/leader-board.dto';
import { leaderBoardBadgeDocument } from './entities/leader-board-badge.entity';
import { leaderBoardLevelDocument } from './entities/leader-board-level.entity';
import { leaderBoardTaskDocument } from './entities/leader-board-task.entity';

@Injectable()
export class LeaderBoardService {
  constructor(
    @InjectModel('leaderBoardLevel')
    private leaderBoardLevelModel: Model<leaderBoardLevelDocument>,
    @InjectModel('leaderBoardBadge')
    private leaderBoardBadgeModel: Model<leaderBoardBadgeDocument>,
    @InjectModel('leaderBoardTask')
    private taskModel: Model<leaderBoardTaskDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async createLevel(createDto: CreateLeaderBoardLevelDto) {
    const newLevel = await this.leaderBoardLevelModel.create(createDto);
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.LEVEL_CREATED,
      newLevel,
    );
  }

  async findAllLevel(paginationDto: PaginationDto, isDrpDwn: boolean | string) {
    const query = await this.filterService.filter(paginationDto);
    const isDropdown =
      typeof isDrpDwn === 'string' ? isDrpDwn === 'true' : isDrpDwn;
    if (isDropdown) {
      return await paginate(this.leaderBoardLevelModel, [], [], query);
    } else {
      return await paginate(
        this.leaderBoardLevelModel,
        paginationDto,
        [],
        query,
      );
    }
  }

  async findOneLevel(id: string) {
    const level = await this.leaderBoardLevelModel.findById(id).exec();
    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found.`);
    }
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.LEVEL_LIST,
      level,
    );
  }

  async updateLevel(id: string, updateDto: UpdateLeaderBoardLevelDto) {
    const updatedLevel = await this.leaderBoardLevelModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );
    if (!updatedLevel) {
      throw new NotFoundException(`Level with ID ${id} not found.`);
    }
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.LEVEL_UPDATED,
      updatedLevel,
    );
  }

  async removeLevel(id: string) {
    const result = await this.leaderBoardLevelModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Level with ID ${id} not found.`);
    }
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.LEVEL_DELETE,
      [],
    );
  }

  async createBadge(badgeData: Partial<CreateBadgeDto>) {
    badgeData.levelId = new mongoose.Types.ObjectId(badgeData.levelId);
    const newBadge = await this.leaderBoardBadgeModel.create(badgeData);
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.BADGE_CREATED,
      newBadge,
    );
  }

  async findAllBadge(paginationDto: PaginationDto, isDrpDwn: boolean | string) {
    const levelPopulateOptions: any = [{ path: 'levelId', select: 'level' }];
    const query = await this.filterService.filter(paginationDto);
    const isDropdown =
      typeof isDrpDwn === 'string' ? isDrpDwn === 'true' : isDrpDwn;
    if (isDropdown) {
      const data = await this.leaderBoardBadgeModel.find({
        levelId: new mongoose.Types.ObjectId(paginationDto?.levelId),
      });
      return this.baseResponse.sendResponse(
        200,
        message.Leader_board_level.BADGE_LIST,
        data,
      );
    } else {
      return await paginate(
        this.leaderBoardBadgeModel,
        paginationDto,
        levelPopulateOptions,
        query,
      );
    }
  }

  async findOneBadge(id: string) {
    const data = await this.leaderBoardBadgeModel
      .findById(id)
      .populate('levelId', 'level')
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.BADGE_LIST,
      data,
    );
  }

  async updateBadge(id: string, updateData: Partial<CreateBadgeDto>) {
    if (updateData.levelId) {
      updateData.levelId = new mongoose.Types.ObjectId(updateData.levelId);
    }
    const updatedBadge = await this.leaderBoardBadgeModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.BADGE_UPDATED,
      updatedBadge,
    );
  }

  async deleteBadge(id: string) {
    await this.leaderBoardBadgeModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.BADGE_DELETE,
      [],
    );
  }
  async createTask(createTaskDto: CreateTaskDto) {
    createTaskDto.levelId = new mongoose.Types.ObjectId(createTaskDto.levelId);
    createTaskDto.badgeId = new mongoose.Types.ObjectId(createTaskDto.badgeId);
    const task = await this.taskModel.create(createTaskDto);
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_CREATED,
      task,
    );
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.levelId) {
      updateTaskDto.levelId = new mongoose.Types.ObjectId(
        updateTaskDto.levelId,
      );
    }
    if (updateTaskDto.badgeId) {
      updateTaskDto.badgeId = new mongoose.Types.ObjectId(
        updateTaskDto.badgeId,
      );
    }
    const data = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, {
      new: true,
    });
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_UPDATED,
      data,
    );
  }
  async findOneTask(id: string) {
    const data = await this.taskModel
      .findById(id)
      .populate([
        { path: 'levelId', select: 'level' },
        { path: 'badgeId', select: 'badge' },
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_LIST,
      data,
    );
  }
  async findAllTask(paginationDto: PaginationDto) {
    const { levelId, badgeId } = paginationDto;

    // Build the query object based on optional levelId and badgeId
    const query: any = {};
    if (levelId) query.levelId = new mongoose.Types.ObjectId(levelId);
    if (badgeId) query.badgeId = new mongoose.Types.ObjectId(badgeId);

    const populateOptions = [
      { path: 'levelId', select: 'level' },
      { path: 'badgeId', select: 'badge' },
    ];

    const data = await paginate(
      this.taskModel,
      paginationDto,
      populateOptions,
      query,
    );
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_LIST,
      data,
    );
  }

  async deleteTask(id: string) {
    this.taskModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_DELETE,
      [],
    );
  }
  async getTasksGroupedByLevel() {
    const result = await this.taskModel.aggregate([
      {
        $lookup: {
          from: 'leaderboardlevels', // Collection name for 'leaderBoardLevel'
          localField: 'levelId',
          foreignField: '_id',
          as: 'level',
        },
      },

      {
        $unwind: '$level',
      },
      {
        $lookup: {
          from: 'leaderboardbadges', // Collection name for 'leaderBoardBadge'
          localField: 'badgeId',
          foreignField: '_id',
          as: 'badge',
        },
      },
      {
        $unwind: '$badge',
      },
      {
        $sort: { 'level.createdAt': 1 }, // Sort by the createdAt field of the level
      },
      {
        $group: {
          _id: '$levelId',
          level: { $first: '$level.level' }, // Assuming 'level' contains level name
          tasks: {
            $push: {
              badgeId: '$badgeId',
              badge_name: '$badge.badge', // Assuming 'badge' contains badge name
              minSpent: '$minSpent',
              subModuleUsageCount: '$subModuleUsageCount',
              appOpenedCount: '$appOpenedCount',
              chatbotUsageCount: '$chatbotUsageCount',

              totalTask: '$totalTask',
              kbaseCompletion: '$kbaseCompletion',
              correctnessOfAnswers: '$correctnessOfAnswers',
              totalAssessments: '$totalAssessments',
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Remove the default _id field from group output
          levelId: '$_id',
          level: 1,
          tasks: 1,
        },
      },
    ]);

    return this.baseResponse.sendResponse(
      200,
      message.Leader_board_level.TASK_LIST,
      result,
    );
  }
}
