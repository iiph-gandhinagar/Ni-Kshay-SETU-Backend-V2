import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { paginate } from '../common/pagination/pagination.service';
import { LeaderBoardService } from './leader-board.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockLeaderBoardLevelModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockReturnValue({
    exec: jest
      .fn()
      .mockReturnValue({ _id: '6666c830eb18953046b1b56b', level: 'Level 1' }),
  }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockLeaderboardBadgeModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockReturnValue({
    exec: jest
      .fn()
      .mockReturnValue({ _id: '6666c830eb18953046b1b56b', badge: 'badge 1' }),
  }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockAggregatedResult = [
  {
    levelId: '64f35bd2eeb8cdbdafaf258b',
    level: 'Level 1',
    tasks: [
      {
        badgeId: '64f35bd2eeb8cdbdafaf2599',
        badge_name: 'Badge A',
        minSpent: 10,
        subModuleUsageCount: 5,
        appOpenedCount: 3,
        chatbotUsageCount: 2,
        totalTask: 6,
        kbaseCompletion: 90,
        correctnessOfAnswers: 80,
        totalAssessments: 3,
      },
    ],
  },
];

const mockLeaderBoardTaskModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      exec: jest.fn().mockReturnValue({
        _id: '6666c830eb18953046b1b56b',
        badgeId: { _id: '2', badge: 'Badge 1' },
        levelId: { _id: '1', level: 'Level 1' },
        name: 'Task A',
      }),
    }),
  }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn().mockResolvedValue(mockAggregatedResult),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('LeaderBoardService', () => {
  let service: LeaderBoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderBoardService,
        {
          provide: getModelToken('leaderBoardLevel'),
          useValue: mockLeaderBoardLevelModel,
        },
        {
          provide: getModelToken('leaderBoardBadge'),
          useValue: mockLeaderboardBadgeModel,
        },
        {
          provide: getModelToken('leaderBoardTask'),
          useValue: mockLeaderBoardTaskModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<LeaderBoardService>(LeaderBoardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLevel', () => {
    it('Should create Level of Leaderboard', async () => {
      const createLeaderboardLevelDto = {
        level: 'level1',
        content: ' level1 content',
      };
      const mockLeaderboardLevel = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createLeaderboardLevelDto,
      };
      mockLeaderBoardLevelModel.create.mockResolvedValue(mockLeaderboardLevel);
      const result = await service.createLevel(createLeaderboardLevelDto);
      expect(mockLeaderBoardLevelModel.create).toHaveBeenCalledWith(
        createLeaderboardLevelDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'level Created successfully',
        data: mockLeaderboardLevel,
      });
    });
  });

  describe('createBadge', () => {
    it('Should create Badge of Leaderboard', async () => {
      const createLeaderboardBadgeDto = {
        badge: 'badge1',
        levelId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        index: 1,
      };
      const mockLeaderboardBadge = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createLeaderboardBadgeDto,
      };
      mockLeaderboardBadgeModel.create.mockResolvedValue(mockLeaderboardBadge);
      const result = await service.createBadge(createLeaderboardBadgeDto);
      expect(mockLeaderboardBadgeModel.create).toHaveBeenCalledWith(
        createLeaderboardBadgeDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Badge Created successfully',
        data: mockLeaderboardBadge,
      });
    });
  });

  describe('createTask', () => {
    it('Should create Task of Leaderboard', async () => {
      const createLeaderboardTaskDto = {
        levelId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        badgeId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        minSpent: 25,
        subModuleUsageCount: 34,
        chatbotUsageCount: 34,
        kbaseCompletion: 2,
        appOpenedCount: 25,
        correctnessOfAnswers: 24,
        totalAssessments: 20,
      };
      const mockLeaderboardTaskLevel = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createLeaderboardTaskDto,
      };
      mockLeaderBoardTaskModel.create.mockResolvedValue(
        mockLeaderboardTaskLevel,
      );
      const result = await service.createTask(createLeaderboardTaskDto);
      expect(mockLeaderBoardTaskModel.create).toHaveBeenCalledWith(
        createLeaderboardTaskDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Task Created successfully',
        data: mockLeaderboardTaskLevel,
      });
    });
  });

  describe('findAllLevel', () => {
    it('should return paginated dropdown data if isDrpDwn is true', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { some: 'query' };
      const mockResult = [{ level: 1 }];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllLevel(paginationDto, 'true');

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockLeaderBoardLevelModel,
        [],
        [],
        mockQuery,
      );

      expect(result).toEqual(mockResult);
    });

    it('should return full paginated result if isDrpDwn is false', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { another: 'query' };
      const mockResult = [{ level: 2 }];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllLevel(paginationDto, false);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockLeaderBoardLevelModel,
        paginationDto,
        [],
        mockQuery,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllBadge', () => {
    it('should return paginated dropdown data if isDrpDwn is true', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockResult = [{ _id: 'badge1' }, { _id: 'badge2' }];

      mockLeaderboardBadgeModel.find.mockResolvedValue(mockResult);

      const result = await service.findAllBadge(paginationDto, 'true');

      expect(mockLeaderboardBadgeModel.find).toHaveBeenCalledWith({
        levelId: expect.any(mongoose.Types.ObjectId),
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Badge fetch successfully',
        data: mockResult,
      });
    });

    it('should return full paginated result if isDrpDwn is false', async () => {
      const levelPopulateOptions: any = [{ path: 'levelId', select: 'level' }];
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockResult = [{ _id: 'badge1' }, { _id: 'badge2' }];
      const mockQuery = {
        levelId: new mongoose.Types.ObjectId('67f35bd2eeb8cdbdafaf258b'),
      };
      mockFilterService.filter.mockResolvedValue(mockQuery);

      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllBadge(paginationDto, false);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockLeaderboardBadgeModel,
        paginationDto,
        levelPopulateOptions,
        mockQuery,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllTask', () => {
    it('should return full paginated result', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockResult = [{ _id: 'task1' }, { _id: 'task2' }];

      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllTask(paginationDto);

      expect(paginate).toHaveBeenCalledWith(
        mockLeaderBoardTaskModel,
        paginationDto,
        [
          { path: 'levelId', select: 'level' },
          { path: 'badgeId', select: 'badge' },
        ],
        {},
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Task fetch successfully',
        data: mockResult,
      });
    });
    it('should build query without badgeId if not provided', async () => {
      const levelId = new mongoose.Types.ObjectId();
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        levelId: levelId.toHexString(),
      };
      const mockResult = [{ _id: 'task1' }, { _id: 'task2' }];

      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllTask(paginationDto);

      expect(paginate).toHaveBeenCalledWith(
        mockLeaderBoardTaskModel,
        paginationDto,
        expect.any(Array),
        {
          levelId: new mongoose.Types.ObjectId(paginationDto.levelId),
        },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Task fetch successfully',
        data: mockResult,
      });
    });
    it('should build query', async () => {
      const levelId = new mongoose.Types.ObjectId();
      const badgeId = new mongoose.Types.ObjectId();
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        levelId: levelId.toHexString(),
        badgeId: badgeId.toHexString(),
      };
      const mockResult = [{ _id: 'task1' }, { _id: 'task2' }];

      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAllTask(paginationDto);

      expect(paginate).toHaveBeenCalledWith(
        mockLeaderBoardTaskModel,
        paginationDto,
        expect.any(Array),
        {
          levelId: new mongoose.Types.ObjectId(paginationDto.levelId),
          badgeId: new mongoose.Types.ObjectId(paginationDto.badgeId),
        },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Task fetch successfully',
        data: mockResult,
      });
    });
  });

  describe('findOneLevel', () => {
    it('should return level data if found', async () => {
      const levelId = '6666c830eb18953046b1b56b';
      const mockLevel = { _id: levelId, level: 'Level 1' };

      const result = await service.findOneLevel(levelId);

      expect(mockLeaderBoardLevelModel.findById).toHaveBeenCalledWith(levelId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'level fetch successfully', // You can match exact message if needed
        data: mockLevel,
      });
    });

    it('should throw NotFoundException if level not found', async () => {
      const levelId = '6666c830eb18953046b1b56b';
      mockLeaderBoardLevelModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOneLevel(levelId)).rejects.toThrow(
        new NotFoundException(`Level with ID ${levelId} not found.`),
      );

      expect(mockLeaderBoardLevelModel.findById).toHaveBeenCalledWith(levelId);
    });
  });

  describe('findOneBadge', () => {
    it('should return badge data with populated levelId', async () => {
      const badgeId = '6666c830eb18953046b1b56b';
      const mockBadge = {
        _id: badgeId,
        name: 'Badge A',
        levelId: { _id: '1', level: 'Level 1' },
      };

      mockLeaderboardBadgeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBadge),
        }),
      });

      const result = await service.findOneBadge(badgeId);

      expect(mockLeaderboardBadgeModel.findById).toHaveBeenCalledWith(badgeId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Badge fetch successfully',
        data: mockBadge,
      });
    });
  });

  describe('findOneTask', () => {
    it('should return badge data with populated levelId', async () => {
      const taskId = '6666c830eb18953046b1b56b';
      const mockTask = {
        _id: taskId,
        name: 'Task A',
        levelId: { _id: '1', level: 'Level 1' },
        badgeId: { _id: '2', badge: 'Badge 1' },
      };

      mockLeaderboardBadgeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTask),
        }),
      });

      const result = await service.findOneTask(taskId);

      expect(mockLeaderBoardTaskModel.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Task fetch successfully',
        data: mockTask,
      });
    });
  });

  describe('updateLevel', () => {
    it('should update and return the updated level', async () => {
      const updatedLevel = { _id: '1', level: 'Updated Level' };
      mockLeaderBoardLevelModel.findByIdAndUpdate.mockResolvedValue(
        updatedLevel,
      );

      const result = await service.updateLevel('1', {
        level: 'Updated level',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'level updated successfully',
        data: updatedLevel,
      });
      expect(mockLeaderBoardLevelModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { level: 'Updated level' },
        { new: true },
      );
    });
    it('should throw NotFoundException if level is not found', async () => {
      mockLeaderBoardLevelModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.updateLevel('1', {
          level: 'Updated level',
        }),
      ).rejects.toThrow(new NotFoundException(`Level with ID 1 not found.`));
    });
  });

  describe('updateBadge', () => {
    it('should update and return the updated Badge', async () => {
      const badgeId = '1';
      const updatedBadgeMock = {
        _id: badgeId,
        badge: 'Updated Badge',
      };
      mockLeaderboardBadgeModel.findByIdAndUpdate.mockResolvedValue(
        updatedBadgeMock,
      );

      const result = await service.updateBadge(badgeId, {
        badge: 'Updated badge',
      });
      expect(mockLeaderboardBadgeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        badgeId,
        { badge: 'Updated badge' },
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Badge updated successfully',
        data: updatedBadgeMock,
      }),
        expect(
          mockLeaderboardBadgeModel.findByIdAndUpdate,
        ).toHaveBeenCalledWith('1', { badge: 'Updated badge' }, { new: true });
    });
  });

  describe('updateTask', () => {
    it('should update and return the updated Badge', async () => {
      const levelId = new mongoose.Types.ObjectId('6666c830eb18953046b1b56b');
      const badgeId = new mongoose.Types.ObjectId('6666c830eb18953046b1b56b');
      const taskId = '6666c830eb18953046b1b56b';
      const updateDto = {
        levelId: levelId,
        badgeId: badgeId,
      };
      const updatedTaskMock = {
        _id: taskId,
        task: 'Updated task',
        levelId: levelId,
        badgeId: badgeId,
      };

      mockLeaderBoardTaskModel.findByIdAndUpdate.mockResolvedValue(
        updatedTaskMock,
      );

      const result = await service.updateTask(taskId, {
        ...updateDto,
        minSpent: 0,
        subModuleUsageCount: 0,
        chatbotUsageCount: 0,
        appOpenedCount: 0,
        kbaseCompletion: 0,
        correctnessOfAnswers: 0,
        totalAssessments: 0,
      });
      expect(mockLeaderBoardTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        taskId,
        {
          ...updateDto,
          minSpent: 0,
          subModuleUsageCount: 0,
          chatbotUsageCount: 0,
          appOpenedCount: 0,
          kbaseCompletion: 0,
          correctnessOfAnswers: 0,
          totalAssessments: 0,
        },
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Task updated successfully',
        data: updatedTaskMock,
      });
    });
  });

  describe('removeLevel', () => {
    it('should delete a Level by ID', async () => {
      mockLeaderBoardLevelModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.removeLevel('1');

      expect(mockLeaderBoardLevelModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'level deleted successfully',
        data: [],
      });
    });
  });

  describe('deleteBadge', () => {
    it('should delete a Badge by ID', async () => {
      mockLeaderboardBadgeModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.deleteBadge('1');

      expect(mockLeaderboardBadgeModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Badge deleted successfully',
        data: [],
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a Task by ID', async () => {
      mockLeaderBoardTaskModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.deleteTask('1');

      expect(mockLeaderBoardTaskModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Task deleted successfully',
        data: [],
      });
    });
  });

  describe('getTaskGroupedByLevel', () => {
    it('should return grouped tasks by level with badges', async () => {
      const result = await service.getTasksGroupedByLevel();

      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: mockAggregatedResult,
      });
    });
  });
});
