import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { SubscriberProgressService } from './subscriber-progress.service';

const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockFindOne = jest.fn();
const mockCollection = jest.fn().mockReturnValue({ findOne: mockFindOne });
const mockDb = jest.fn().mockReturnValue({ collection: mockCollection });

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      db: mockDb,
      close: mockClose,
    })),
    ObjectId: jest.requireActual('mongodb').ObjectId,
  };
});
const mockSubscriberProgressModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Block' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
  updateOne: jest.fn().mockResolvedValue({}),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn().mockReturnThis(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockLeaderBoardService = {
  getTasksGroupedByLevel: jest.fn().mockReturnValue({}),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
};

const mockSubscriberActivityModel = {
  findOne: jest.fn(),
  aggregate: jest.fn().mockReturnThis(),
};

const mockLeaderBoardLevelModel = {
  findOne: jest.fn(),
};

const mockLeaderBoardBadgeModel = {
  findOne: jest.fn(),
};

const mockLeaderBoardTaskModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
  sendError: jest.fn().mockImplementation((statusCode, errorMessage, data) => ({
    statusCode,
    errorMessage,
    data,
  })),
};
describe('SubscriberProgressService', () => {
  let service: SubscriberProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberProgressService,
        {
          provide: getModelToken('subscriberProgressHistory'),
          useValue: mockSubscriberProgressModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('leaderBoardLevel'),
          useValue: mockLeaderBoardLevelModel,
        },
        {
          provide: getModelToken('leaderBoardBadge'),
          useValue: mockLeaderBoardBadgeModel,
        },
        {
          provide: getModelToken('leaderBoardTask'),
          useValue: mockLeaderBoardTaskModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: LeaderBoardService, useValue: mockLeaderBoardService },
      ],
    }).compile();

    service = module.get<SubscriberProgressService>(SubscriberProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createMockQueryChain(result: any) {
    return {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(result),
    };
  }

  describe('updateSubscriberProgress', () => {
    it('should update subscriber progress when document exists', async () => {
      const mockData = { userId: '123', action: 'user_home_page_visit' };
      mockSubscriberProgressModel.findOne.mockResolvedValueOnce({ _id: '1' });
      mockSubscriberProgressModel.updateOne.mockResolvedValueOnce({});

      await service.updateSubscriberProgress(mockData);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: mockData.userId,
      });
      expect(mockSubscriberProgressModel.updateOne).toHaveBeenCalled();
    });

    it('should create a new subscriber progress document when none exists', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        appOpenedCount: 1,
        chatbotUsageCount: 0,
        updatedAt: new Date(),
        levelId: 'level1',
      };

      // Mock the model methods
      mockSubscriberProgressModel.findOne.mockResolvedValueOnce(null);
      mockLeaderBoardLevelModel.findOne.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce({ _id: 'level1', index: 1 }),
      }); // Simulate no existing subscriber
      mockSubscriberProgressModel.create.mockResolvedValueOnce({
        _id: '1',
        ...mockData,
      });

      await service.updateSubscriberProgress({
        userId: '6666c830eb18953046b1b56b',
        action: 'user_home_page_visit',
      });

      // Check that `findOne` was called with the userId
      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: mockData.userId,
      });

      // Check that `create` was called with the expected arguments
      expect(mockSubscriberProgressModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockData.userId,
          appOpenedCount: 1,
          chatbotUsageCount: 0,
          levelId: mockData.levelId,
          updatedAt: expect.any(Date),
        }),
      );

      // Check that `create` was called once
      expect(mockSubscriberProgressModel.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const mockData = { userId: '123', action: 'user_home_page_visit' };
      const mockError = new Error('Database error');
      mockSubscriberProgressModel.findOne.mockRejectedValueOnce(mockError);

      await service.updateSubscriberProgress(mockData);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: mockData.userId,
      });
    });
  });

  describe('updateSubModuleUsageCount', () => {
    it('should update submodule usage count when valid data is provided', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
        totalTime: 100,
      };
      const mockAggregationResult = [
        {
          count: 1,
        },
      ];
      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce(
        mockAggregationResult,
      );

      await service.updateSubModuleUsageCount(mockData);

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(mockData.userId),
            action: 'submodule_usage',
          },
        },
        {
          $group: {
            _id: {
              subModule: '$subModule',
              totalTime: '$totalTime',
            },
            uniqueTotalTime: { $first: '$totalTime' },
            totalTimeSpentSum: { $sum: '$timeSpent' },
          },
        },
        {
          $project: {
            _id: 0,
            uniqueTotalTime: 1,
            totalTimeSpentSum: 1,
            isValid: {
              $cond: {
                if: { $gte: ['$totalTimeSpentSum', '$uniqueTotalTime'] },
                then: 1,
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: '$isValid' },
          },
        },
      ]);
    });

    it('should handle cases where no submodule usage is found', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
        totalTime: 100,
      };
      const mockAggregationResult = [{ count: 0 }];
      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce(
        mockAggregationResult,
      );

      await service.updateSubModuleUsageCount(mockData);

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(mockData.userId),
            action: 'submodule_usage',
          },
        },
        {
          $group: {
            _id: {
              subModule: '$subModule',
              totalTime: '$totalTime',
            },
            uniqueTotalTime: { $first: '$totalTime' },
            totalTimeSpentSum: { $sum: '$timeSpent' },
          },
        },
        {
          $project: {
            _id: 0,
            uniqueTotalTime: 1,
            totalTimeSpentSum: 1,
            isValid: {
              $cond: {
                if: { $gte: ['$totalTimeSpentSum', '$uniqueTotalTime'] },
                then: 1,
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: '$isValid' },
          },
        },
      ]);
    });

    it('should handle errors gracefully', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
        totalTime: 100,
      };
      const mockError = new Error('Database error');
      mockSubscriberActivityModel.aggregate.mockRejectedValueOnce(mockError);

      await service.updateSubModuleUsageCount(mockData);

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(mockData.userId),
            action: 'submodule_usage',
          },
        },
        {
          $group: {
            _id: {
              subModule: '$subModule',
              totalTime: '$totalTime',
            },
            uniqueTotalTime: { $first: '$totalTime' },
            totalTimeSpentSum: { $sum: '$timeSpent' },
          },
        },
        {
          $project: {
            _id: 0,
            uniqueTotalTime: 1,
            totalTimeSpentSum: 1,
            isValid: {
              $cond: {
                if: { $gte: ['$totalTimeSpentSum', '$uniqueTotalTime'] },
                then: 1,
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: '$isValid' },
          },
        },
      ]);
    });
  });

  describe('updateOverallAppUsageMinSpent', () => {
    it('should update minSpent when valid data is provided', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
      };
      const mockAggregationResult = [
        {
          _id: '6666c830eb18953046b1b56b',
          totalTime: 3600, // 1 hour in seconds
        },
      ];
      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce(
        mockAggregationResult,
      );
      mockSubscriberProgressModel.updateOne.mockResolvedValueOnce({});

      const result = await service.updateOverallAppUsageMinSpent(mockData);

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            module: 'overall_app_usage',
            action: 'app_usage',
            userId: mockData.userId,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalTime: { $sum: '$timeSpent' },
          },
        },
      ]);
      expect(mockSubscriberProgressModel.updateOne).toHaveBeenCalledWith(
        { userId: mockData.userId },
        { $set: { minSpent: 60 } }, // 3600 seconds = 60 minutes
      );
      expect(result).toBe(60);
    });

    it('should throw an error when no app usage data is found', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
      };
      const mockAggregationResult = [];
      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce(
        mockAggregationResult,
      );

      await expect(
        service.updateOverallAppUsageMinSpent(mockData),
      ).rejects.toThrow(
        `No activity data found for userId ${mockData.userId}.`,
      );

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            module: 'overall_app_usage',
            action: 'app_usage',
            userId: mockData.userId,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalTime: { $sum: '$timeSpent' },
          },
        },
      ]);

      expect(mockSubscriberProgressModel.updateOne).not.toHaveBeenCalled();
    });

    it('should handle cases where timeSpent is not greater than 0', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 0,
      };

      const result = await service.updateOverallAppUsageMinSpent(mockData);

      expect(mockSubscriberActivityModel.aggregate).not.toHaveBeenCalled();
      expect(mockSubscriberProgressModel.updateOne).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const mockData = {
        userId: '6666c830eb18953046b1b56b',
        timeSpent: 120,
      };
      const mockError = new Error('Database error');
      mockSubscriberActivityModel.aggregate.mockRejectedValueOnce(mockError);

      await expect(
        service.updateOverallAppUsageMinSpent(mockData),
      ).rejects.toThrow('Database error');

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            module: 'overall_app_usage',
            action: 'app_usage',
            userId: mockData.userId,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalTime: { $sum: '$timeSpent' },
          },
        },
      ]);

      expect(mockSubscriberProgressModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('getAndUpdateProgressByLevel', () => {
    it('should fetch and update progress by level when user activities exist', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockUserActivities = {
        userId: new mongoose.Types.ObjectId(mockUserId),
        subscriberHistory: [],
      };
      const mockTaskData = {
        data: [
          {
            level: 'Level 1',
            tasks: [
              { taskId: 'task1', appOpenedCount: 5 },
              { taskId: 'task2', minSpent: 10 },
            ],
          },
        ],
      };

      mockSubscriberProgressModel.findOne.mockResolvedValueOnce(
        mockUserActivities,
      );
      mockLeaderBoardService.getTasksGroupedByLevel.mockResolvedValueOnce(
        mockTaskData,
      );
      mockBaseResponse.sendResponse.mockReturnValueOnce({
        statusCode: 200,
        message: 'Progress fetched and history updated successfully',
        data: [],
      });

      const result = await service.getAndUpdateProgressByLevel(mockUserId);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(mockLeaderBoardService.getTasksGroupedByLevel).toHaveBeenCalled();
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Progress fetched and history updated successfully',
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Progress fetched and history updated successfully',
        data: [],
      });
    });

    it('should return an error response when no user activities are found', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      mockSubscriberProgressModel.findOne.mockResolvedValueOnce(null);

      const result = await service.getAndUpdateProgressByLevel(mockUserId);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(result).toEqual({
        status: false,
        message: 'No progress history found for the user',
      });
    });

    it('should return an error response when no task data is available', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockUserActivities = {
        userId: new mongoose.Types.ObjectId(mockUserId),
        subscriberHistory: [],
      };

      mockSubscriberProgressModel.findOne.mockResolvedValueOnce(
        mockUserActivities,
      );
      mockLeaderBoardService.getTasksGroupedByLevel.mockResolvedValueOnce({
        data: [],
      });

      const result = await service.getAndUpdateProgressByLevel(mockUserId);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(mockLeaderBoardService.getTasksGroupedByLevel).toHaveBeenCalled();
      expect(result).toEqual({
        status: false,
        message: 'No task data available',
      });
    });

    it('should handle errors gracefully', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockError = new Error('Database error');

      mockSubscriberProgressModel.findOne.mockRejectedValueOnce(mockError);

      const result = await service.getAndUpdateProgressByLevel(mockUserId);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(result).toEqual({
        status: false,
        message: 'Error processing progress',
      });
    });
  });

  describe('getAchievementByLevelAndBadge', () => {
    const userId = '6666c830eb18953046b1b56b';

    it('should return achievement data when aggregation succeeds', async () => {
      const mockAggregationResult = [
        {
          _id: {
            badgeId: 'badge123',
          },
          badgeName: 'Top Learner',
          totalAchievements: 3,
        },
      ];

      mockSubscriberProgressModel.aggregate.mockResolvedValueOnce(
        mockAggregationResult,
      );

      const response = await service.getAchievementByLevelAndBadge(userId);

      expect(mockSubscriberProgressModel.aggregate).toHaveBeenCalledWith([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$subscriberHistory' },
        {
          $lookup: {
            from: 'leaderboardbadges',
            localField: 'subscriberHistory.badgeId',
            foreignField: '_id',
            as: 'badgeDetails',
          },
        },
        {
          $lookup: {
            from: 'leaderboardlevels',
            localField: 'subscriberHistory.levelId',
            foreignField: '_id',
            as: 'levelDetails',
          },
        },
        {
          $addFields: {
            badgeName: { $arrayElemAt: ['$badgeDetails.badge', 0] },
          },
        },
        {
          $group: {
            _id: {
              badgeId: '$subscriberHistory.badgeId',
            },
            badgeName: { $first: '$badgeName' },
            totalAchievements: { $sum: 1 },
          },
        },
        {
          $match: {
            '_id.badgeId': { $ne: null },
          },
        },
        { $sort: { totalAchievements: -1 } },
      ]);

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Achievements !!',
        mockAggregationResult,
      );
      expect(response).toEqual(
        mockBaseResponse.sendResponse(
          200,
          'Achievements !!',
          mockAggregationResult,
        ),
      );
    });

    it('should return error response if aggregation result is null/undefined', async () => {
      mockSubscriberProgressModel.aggregate.mockResolvedValueOnce(null);

      const response = await service.getAchievementByLevelAndBadge(userId);

      expect(mockBaseResponse.sendError).toHaveBeenCalledWith(
        400,
        'No progress history found for the user',
        [],
      );
      expect(response).toEqual(
        mockBaseResponse.sendError(
          400,
          'No progress history found for the user',
          [],
        ),
      );
    });

    it('should handle aggregation failure and return error response', async () => {
      mockSubscriberProgressModel.aggregate.mockRejectedValueOnce(
        new Error('Aggregation failed'),
      );

      const response = await service.getAchievementByLevelAndBadge(userId);

      expect(response).toEqual({
        status: false,
        message: 'Error processing progress',
      });
    });
  });

  describe('getLeaderboardDetailsOfUser', () => {
    it('should return leaderboard details when user data exists', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockLeaderboardData = {
        userId: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNo: '1234567890',
        },
        levelId: { level: 'Level 1' },
        badgeId: { badge: 'Gold' },
        taskCompleted: 8, // Assuming this is a field in the leaderboard data
      };
      const mockTaskAggregationResult = [{ totalTaskSum: 10 }];

      // Mock the necessary methods
      mockSubscriberProgressModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValueOnce(mockLeaderboardData),
            }),
          }),
        }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValueOnce(
        mockTaskAggregationResult,
      );
      mockBaseResponse.sendResponse.mockReturnValueOnce({
        statusCode: 200,
        message: 'Leaderboard Details Fetch Successfully',
        data: mockLeaderboardData,
      });

      // Ensure aggregate is called correctly
      const result = await service.getLeaderboardDetailsOfUser(mockUserId);

      console.log('After service call'); // Log to confirm the test reaches this point

      // Verify that findOne was called with the correct parameters
      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });

      // Ensure it was called with the expected aggregation pipeline
      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalTaskSum: { $sum: '$totalTask' },
          },
        },
      ]);

      // Verify the response sent with the correct data
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Leaderboard Details Fetch Successfully',
        mockLeaderboardData,
      );

      // Check the result returned by the service
      expect(result).toEqual({
        statusCode: 200,
        message: 'Leaderboard Details Fetch Successfully',
        data: mockLeaderboardData,
      });
    });

    it('should return an error response when no leaderboard data is found', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      // Mock findOne to return a valid structure, but with null data for the user
      mockSubscriberProgressModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValueOnce(null), // Simulating no leaderboard data found
            }),
          }),
        }),
      });

      // Mock aggregate to return an empty result
      mockLeaderBoardTaskModel.aggregate.mockResolvedValueOnce([]); // Empty array simulates no tasks

      const result = await service.getLeaderboardDetailsOfUser(mockUserId);

      // Check if the findOne method was called with correct parameters
      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });

      // Verify that aggregate was called even when no tasks are found
      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalTaskSum: { $sum: '$totalTask' },
          },
        },
      ]);

      // Ensure that the response is sent with a status code 500 and appropriate message when no data is found
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        500,
        'Error processing leaderboard details',
        null,
      );

      // Verify the result returned by the service
      expect(result).toEqual({
        statusCode: 500,
        message: 'Error processing leaderboard details',
        data: null,
      });
    });
  });

  describe('getOverallAchievement', () => {
    const mockUserId = '6666c830eb18953046b1b56b';

    it('should return overall achievement data when valid data exists', async () => {
      const mockTotalTaskResult = [
        {
          _id: null,
          totalTasks: 10,
        },
      ];
      const mockUserActivities = {
        userId: new mongoose.Types.ObjectId(mockUserId),
        appOpenedCount: 5,
        minSpent: 120,
        subModuleUsageCount: 3,
        chatbotUsageCount: 2,
        kbaseCompletion: 1,
        totalAssessments: 2,
        correctnessOfAnswers: 80,
        subscriberHistory: [{ level: 'Level 1', badge_name: 'Bronze' }],
      };
      const mockTaskData = {
        data: [
          {
            level: 'Level 1',
            tasks: [
              { appOpenedCount: 5, minSpent: 100, subModuleUsageCount: 2 },
            ],
          },
        ],
      };

      mockLeaderBoardTaskModel.aggregate.mockResolvedValueOnce(
        mockTotalTaskResult,
      );
      mockSubscriberProgressModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockUserActivities),
      });
      mockLeaderBoardService.getTasksGroupedByLevel.mockResolvedValueOnce(
        mockTaskData,
      );

      const result = await service.getOverallAchievement(mockUserId);

      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$totalTask' },
          },
        },
      ]);
      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(mockLeaderBoardService.getTasksGroupedByLevel).toHaveBeenCalled();
      expect(result).toEqual({
        data: {
          completedTasks: undefined,
          currentBadge: undefined,
          currentLevel: undefined,
          pendingTasks: NaN,
          totalTasks: 10,
        },
      });
    });

    it('should return an error response when no user activities are found', async () => {
      mockLeaderBoardTaskModel.aggregate.mockResolvedValueOnce([
        { _id: null, totalTasks: 10 },
      ]);
      mockSubscriberProgressModel.findOne.mockResolvedValueOnce(null);

      const result = await service.getOverallAchievement(mockUserId);

      expect(mockSubscriberProgressModel.findOne).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });
      expect(result).toEqual({
        status: false,
        message: 'Error processing overall progress',
      });
    });

    it('should return an error response when no task data is available', async () => {
      const mockUserActivities = {
        userId: new mongoose.Types.ObjectId(mockUserId),
        subscriberHistory: [],
      };

      mockLeaderBoardTaskModel.aggregate.mockResolvedValueOnce([
        { _id: null, totalTasks: 10 },
      ]);

      mockSubscriberProgressModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockUserActivities),
      });
      mockLeaderBoardService.getTasksGroupedByLevel.mockResolvedValueOnce({
        data: [],
      });

      const result = await service.getOverallAchievement(mockUserId);

      expect(mockLeaderBoardService.getTasksGroupedByLevel).toHaveBeenCalled();
      expect(result).toEqual({
        status: false,
        message: 'No task data available',
      });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error');
      mockLeaderBoardTaskModel.aggregate.mockRejectedValueOnce(mockError);

      const result = await service.getOverallAchievement(mockUserId);

      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$totalTask' },
          },
        },
      ]);
      expect(result).toEqual({
        status: false,
        message: 'Error processing overall progress',
      });
    });
  });

  describe('top3SubscriberList', () => {
    const mockUserData = { _id: 'user123' };

    const mockTotalTaskResult = [{ totalTasks: 15 }];

    const mockUsersProgress = [
      {
        userId: 'user1',
        name: 'Alice',
        profileImage: 'https://example.com/image.png',
        cadreTitle: 'Healthcare Worker',
        completedTasks: 0,
        cadreType: 'Frontline',
        totalTasks: 15,
        level: 'Advanced',
        badge: 'Gold',
        percentageCompleted: '0.00',
      },
      {
        userId: 'user2',
        name: 'Bob',
        completedTasks: 0,
        profileImage: null,
        cadreTitle: 'Nurse',
        cadreType: 'Support',
        totalTasks: 15,
        level: 'Intermediate',
        badge: 'Silver',
        percentageCompleted: '0.00',
      },
      {
        userId: 'user3',
        name: 'Charlie',
        completedTasks: 0,
        profileImage: null,
        cadreTitle: 'Community Volunteer',
        cadreType: 'Support',
        totalTasks: 15,
        level: 'Beginner',
        badge: 'Bronze',
        percentageCompleted: '0.00',
      },
    ];
    it('should return top 3 subscribers successfully', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue(
        mockUsersProgress,
      );

      const result = await service.top3SubscriberList(mockUserData);

      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        _id: mockUserData._id,
      });
      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalled();
      expect(mockSubscriberProgressModel.aggregate).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'User and all users task summary fetched successfully',
        data: mockUsersProgress,
      });
    });

    it('should add one competitor if only 2 users are found', async () => {
      const twoUsers = mockUsersProgress.slice(0, 2);
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue(twoUsers);

      const result = await service.top3SubscriberList(mockUserData);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User and all users task summary fetched successfully',
        data: [
          {
            userId: 'user1',
            name: 'Alice',
            profileImage: 'https://example.com/image.png',
            cadreTitle: 'Healthcare Worker',
            completedTasks: 0,
            cadreType: 'Frontline',
            totalTasks: 15,
            level: 'Advanced',
            badge: 'Gold',
            percentageCompleted: '0.00',
          },
          {
            userId: 'user2',
            name: 'Bob',
            completedTasks: 0,
            profileImage: null,
            cadreTitle: 'Nurse',
            cadreType: 'Support',
            totalTasks: 15,
            level: 'Intermediate',
            badge: 'Silver',
            percentageCompleted: '0.00',
          },
          {
            userId: '669f5ef97978bc59b8224d42',
            name: 'Your Competitors1',
            completedTasks: 0,
            profileImage: null,
            cadreTitle: 'Healthcare Worker',
            cadreType: 'Frontline',
            totalTasks: 15,
            level: 'Beginner',
            badge: '',
            percentageCompleted: '0.00',
          },
        ],
      });
    });

    it('should add two competitors if only 1 user is found', async () => {
      const oneUser = mockUsersProgress.slice(0, 1);
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue(oneUser);

      const result = await service.top3SubscriberList(mockUserData);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User and all users task summary fetched successfully',
        data: [
          {
            userId: 'user1',
            name: 'Alice',
            profileImage: 'https://example.com/image.png',
            cadreTitle: 'Healthcare Worker',
            completedTasks: 0,
            cadreType: 'Frontline',
            totalTasks: 15,
            level: 'Advanced',
            badge: 'Gold',
            percentageCompleted: '0.00',
          },
          {
            userId: '669f5ef97978bc59b8224d42',
            name: 'Your Competitors1',
            completedTasks: 0,
            profileImage: null,
            cadreTitle: 'Healthcare Worker',
            cadreType: 'Frontline',
            totalTasks: 15,
            level: 'Beginner',
            badge: '',
            percentageCompleted: '0.00',
          },
          {
            userId: '669f5ef97978bc59b8224d43',
            name: 'Your Competitors2',
            completedTasks: 0,
            profileImage: null,
            cadreTitle: 'Healthcare Worker',
            cadreType: 'Frontline',
            totalTasks: 'Beginner',
            level: 'Beginner',
            badge: '',
            percentageCompleted: '0.00',
          },
        ],
      });
    });

    it('should return error if current user not found', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await service.top3SubscriberList(mockUserData);

      expect(result.status).toBe(false);
      expect(result.message).toBe('Current user does not have a valid cadreId');
    });

    it('should return undefined if no total tasks found', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue([]);

      const result = await service.top3SubscriberList(mockUserData);

      expect(result).toBeUndefined();
    });

    it('should return undefined if no users progress found', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue([]);

      const result = await service.top3SubscriberList(mockUserData);

      expect(result).toBeUndefined();
    });
  });

  describe('getUserAndAllUsersTaskSummary', () => {
    const mockUserData = { _id: 'user123' };
    const mockPaginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      fromDate: '',
      toDate: '',
    };

    const mockTotalTaskResult = [{ totalTasks: 15 }];

    const mockUsersProgress = [
      {
        userId: 'user1',
        name: 'Alice',
        profileImage: 'https://example.com/image.png',
        cadreTitle: 'Healthcare Worker',
        cadreType: 'Frontline',
        completedTasks: 10,
        totalTasks: 15,
        level: 'Advanced',
        badge: 'Gold',
        percentageCompleted: '66.67',
      },
      {
        userId: 'user2',
        name: 'Bob',
        profileImage: null,
        cadreTitle: 'Nurse',
        cadreType: 'Support',
        completedTasks: 5,
        totalTasks: 15,
        level: 'Intermediate',
        badge: 'Silver',
        percentageCompleted: '33.33',
      },
    ];

    it('should return user and all users task summary successfully', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });

      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue(
        mockUsersProgress,
      );

      const result = await service.getUserAndAllUsersTaskSummary(
        mockUserData,
        mockPaginationDto,
      );

      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        _id: mockUserData._id,
      });
      expect(mockLeaderBoardTaskModel.aggregate).toHaveBeenCalled();
      expect(mockSubscriberProgressModel.aggregate).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'User and all users task summary fetched successfully',
        data: expect.any(Object), // (optional) you can match deeper if you want
      });
    });

    it('should return an error if current user does not have a valid cadreId', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getUserAndAllUsersTaskSummary(
        mockUserData,
        mockPaginationDto,
      );

      expect(result).toEqual({
        status: false,
        message: 'Current user does not have a valid cadreId',
      });
    });

    it('should return undefined if no total tasks are found', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue([]);

      const result = await service.getUserAndAllUsersTaskSummary(
        mockUserData,
        mockPaginationDto,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined if no users progress is found', async () => {
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockLeaderBoardTaskModel.aggregate.mockResolvedValue(mockTotalTaskResult);
      mockSubscriberProgressModel.aggregate.mockResolvedValue([]);

      const result = await service.getUserAndAllUsersTaskSummary(
        mockUserData,
        mockPaginationDto,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('updateCompletedTask', () => {
    const mockTaskId = 'mockTaskId';
    const mockUserId = 'mockUserId';
    const mockCompletedTasks = 5;
    it('should return early if no document found', async () => {
      mockSubscriberProgressModel.findById.mockResolvedValue(null);

      await service.updateCompletedTask(mockTaskId);

      expect(mockSubscriberProgressModel.findById).toHaveBeenCalledWith(
        mockTaskId,
      );
      expect(
        mockSubscriberProgressModel.findByIdAndUpdate,
      ).not.toHaveBeenCalled();
    });

    it('should return early if userProgress has no completedTasks', async () => {
      mockSubscriberProgressModel.findById.mockResolvedValue({
        userId: mockUserId,
      });

      jest.spyOn(service, 'getOverallAchievement').mockResolvedValue({
        data: null,
      });

      await service.updateCompletedTask(mockTaskId);

      expect(service.getOverallAchievement).toHaveBeenCalledWith(mockUserId);
      expect(
        mockSubscriberProgressModel.findByIdAndUpdate,
      ).not.toHaveBeenCalled();
    });

    it('should update taskCompleted if values are different', async () => {
      mockSubscriberProgressModel.findById.mockResolvedValue({
        _id: mockTaskId,
        userId: mockUserId,
        taskCompleted: 3, // Different from mockCompletedTasks
      });

      jest.spyOn(service, 'getOverallAchievement').mockResolvedValue({
        data: {
          totalTasks: 10,
          completedTasks: mockCompletedTasks,
          pendingTasks: 5,
          currentLevel: 'level1',
          currentBadge: 'badge1',
        },
      });

      await service.updateCompletedTask(mockTaskId);

      expect(
        mockSubscriberProgressModel.findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        mockTaskId,
        {
          $set: {
            taskCompleted: mockCompletedTasks,
            source: 'updateCompletedTask',
          },
        },
        { new: true },
      );
    });

    it('should not update if taskCompleted is already correct', async () => {
      mockSubscriberProgressModel.findById.mockResolvedValue({
        _id: mockTaskId,
        userId: mockUserId,
        taskCompleted: mockCompletedTasks, // Same as user progress
      });

      jest.spyOn(service, 'getOverallAchievement').mockResolvedValue({
        data: {
          totalTasks: 10,
          completedTasks: mockCompletedTasks,
          pendingTasks: 5,
          currentLevel: 'level1',
          currentBadge: 'badge1',
        },
      });

      await service.updateCompletedTask(mockTaskId);

      expect(
        mockSubscriberProgressModel.findByIdAndUpdate,
      ).not.toHaveBeenCalled();
    });

    it('should catch and log error if thrown', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSubscriberProgressModel.findById.mockRejectedValue(
        new Error('DB error'),
      );

      await service.updateCompletedTask(mockTaskId);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error in updateCompletedTask for taskId ${mockTaskId}:`,
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateCompletedAssessment', () => {
    it('should update completed assessment correctly', async () => {
      // Mock aggregation result
      mockAssessmentResponseModel.aggregate.mockResolvedValue([
        {
          totalDocuments: 2,
          totalMarksSum: 8,
          totalRightAnswers: 6,
        },
      ]);

      // Mock MongoClient and collection response
      mockFindOne.mockResolvedValue({
        assessments: [
          { pending: 'no', correct: 3 },
          { pending: 'no', correct: 4 },
          { pending: 'yes', correct: 2 }, // should be ignored
        ],
      });

      await service.updateCompletedAssessment('6666c830eb18953046b1b56b');

      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
            isCalculated: true,
          },
        },
        {
          $group: {
            _id: null,
            totalDocuments: { $sum: 1 },
            totalMarksSum: { $sum: '$totalMarks' },
            totalRightAnswers: { $sum: '$rightAnswer' },
          },
        },
      ]);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('userassessments');
      expect(mockFindOne).toHaveBeenCalledWith({
        user_id: '6666c830eb18953046b1b56b',
      });

      // Checking if the update happened correctly
      expect(mockSubscriberProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        },
        {
          totalAssessments: 4, // (2 assessments from aggregate + 2 from Mongo findOne)
          correctnessOfAnswers: expect.any(Number),
        },
      );

      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle no calculated assessments gracefully', async () => {
      mockAssessmentResponseModel.aggregate.mockResolvedValue([]);

      mockFindOne.mockResolvedValue({
        assessments: [],
      });

      await service.updateCompletedAssessment('6666c830eb18953046b1b56b');

      expect(mockSubscriberProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        },
        {
          totalAssessments: 0,
          correctnessOfAnswers: 0,
        },
      );
    });

    it('should handle error properly', async () => {
      mockAssessmentResponseModel.aggregate.mockRejectedValue(
        new Error('DB error'),
      );

      await service.updateCompletedAssessment('6666c830eb18953046b1b56b');

      expect(
        mockSubscriberProgressModel.findOneAndUpdate,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getListOfSubscriberRank', () => {
    it('should return paginated subscribers with filters', async () => {
      const mockData = [
        { _id: new mongoose.Types.ObjectId(), name: 'User1' },
        { _id: new mongoose.Types.ObjectId(), name: 'User2' },
      ];

      const mockTotal = 2;

      mockSubscriberProgressModel.find.mockReturnValue(
        createMockQueryChain(mockData),
      );
      mockSubscriberProgressModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.getListOfSubscriberRank(
        '60d0fe4f5311236168a109ca', // levelId
        '60d0fe4f5311236168a109cb', // badgeId
        '60d0fe4f5311236168a109cc', // userId
        'createdAt', // sortBy
        'asc', // sortOrder
        '2024-01-01', // fromDate
        '2024-12-31', // toDate
        1, // page
        10, // limit
      );

      expect(mockSubscriberProgressModel.find).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(mockSubscriberProgressModel.countDocuments).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Activity fetch Successfully',
        data: {
          list: mockData,
          totalSubscribers: mockTotal,
          currentPage: 1,
          totalPages: 1,
        },
      });
    });

    it('should apply default pagination if page and limit not provided', async () => {
      const mockData = [{ _id: new mongoose.Types.ObjectId(), name: 'User1' }];
      const mockTotal = 1;

      mockSubscriberProgressModel.find.mockReturnValue(
        createMockQueryChain(mockData),
      );
      mockSubscriberProgressModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.getListOfSubscriberRank();

      expect(mockSubscriberProgressModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Activity fetch Successfully',
        data: {
          list: mockData,
          totalSubscribers: mockTotal,
          currentPage: 1,
          totalPages: 1,
        },
      });
    });

    it('should sort in descending order if sortOrder is not "asc"', async () => {
      const mockData = [{ _id: new mongoose.Types.ObjectId(), name: 'User1' }];
      const mockTotal = 1;

      mockSubscriberProgressModel.find.mockReturnValue(
        createMockQueryChain(mockData),
      );
      mockSubscriberProgressModel.countDocuments.mockResolvedValue(mockTotal);

      await service.getListOfSubscriberRank(
        undefined,
        undefined,
        undefined,
        'createdAt',
        'desc',
      );

      expect(mockSubscriberProgressModel.find).toHaveBeenCalled();
      // Here we mainly trust sort() is called internally through the chain
    });
  });

  function createMockQueryChain1(result: any) {
    return {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(result),
    };
  }
  describe('getListOfSubscriberRankCsv', () => {
    it('should return subscriber list based on filters', async () => {
      const mockData = [
        { _id: new mongoose.Types.ObjectId(), name: 'User1' },
        { _id: new mongoose.Types.ObjectId(), name: 'User2' },
      ];

      mockSubscriberProgressModel.find.mockReturnValue(
        createMockQueryChain1(mockData),
      );

      const result = await service.getListOfSubscriberRankCsv(
        '60d0fe4f5311236168a109ca', // levelId
        '60d0fe4f5311236168a109cb', // badgeId
        '60d0fe4f5311236168a109cc', // userId
        '2024-01-01', // fromDate
        '2024-12-31', // toDate
      );

      expect(mockSubscriberProgressModel.find).toHaveBeenCalledWith(
        expect.any(Object),
      );

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        expect.any(String),
        mockData,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: mockData,
      });
    });

    it('should build correct query with date range', async () => {
      const mockData = [{ _id: new mongoose.Types.ObjectId(), name: 'User1' }];

      mockSubscriberProgressModel.find.mockReturnValue(
        createMockQueryChain1(mockData),
      );

      await service.getListOfSubscriberRankCsv(
        undefined,
        undefined,
        undefined,
        '2024-01-01',
        '2024-01-31',
      );

      expect(mockSubscriberProgressModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          }),
        }),
      );
    });

    it('should sort the data by createdAt descending', async () => {
      const mockData = [{ _id: new mongoose.Types.ObjectId(), name: 'User1' }];

      const mockChain = createMockQueryChain1(mockData);
      const sortSpy = jest.spyOn(mockChain, 'sort');

      mockSubscriberProgressModel.find.mockReturnValue(mockChain);

      await service.getListOfSubscriberRankCsv();

      expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
