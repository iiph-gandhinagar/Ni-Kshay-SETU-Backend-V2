import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { aggregate } from '../common/pagination/aggregation.service';
import { SubscriberActivityService } from './subscriber-activity.service';

jest.mock('../common/pagination/aggregation.service', () => ({
  aggregate: jest.fn(),
}));
const mockSubscriberActivityModel = {
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
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  distinct: jest.fn(),
  aggregate: jest.fn(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockLeaderBoardService = {
  getTasksGroupedByLevel: jest.fn().mockResolvedValue([]),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockUserAppVersionModel = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
};
const mockLeaderBoardLevelModel = {
  findOne: jest.fn(),
};
const mockLeaderBoardBadgeModel = {
  findOne: jest.fn(),
};
const mockLeaderBoardTaskModel = {
  findOne: jest.fn(),
};
const mockAlgorithmDiagnosisModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockAdminUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockStateModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockCountryModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockDistrictModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockBlockModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockHealthFacilityModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockCadreModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};
const mockAlgorithmDifferentialCareModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockAlgorithmGuidanceOnAdverseDrugReactionModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAlgorithmTreatmentModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockAlgorithmLatentTbInfectionModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockAlgorithmCgcInterventionModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('SubscriberActivityService', () => {
  let service: SubscriberActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberActivityService,
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('UserAppVersion'),
          useValue: mockUserAppVersionModel,
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
        {
          provide: getModelToken('AlgorithmDiagnosis'),
          useValue: mockAlgorithmDiagnosisModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        {
          provide: getModelToken('HealthFacility'),
          useValue: mockHealthFacilityModel,
        },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        {
          provide: getModelToken('AlgorithmDifferentialCare'),
          useValue: mockAlgorithmDifferentialCareModel,
        },
        {
          provide: getModelToken('AlgorithmGuidanceOnAdverseDrugReaction'),
          useValue: mockAlgorithmGuidanceOnAdverseDrugReactionModel,
        },
        {
          provide: getModelToken('AlgorithmTreatment'),
          useValue: mockAlgorithmTreatmentModel,
        },
        {
          provide: getModelToken('AlgorithmLatentTbInfection'),
          useValue: mockAlgorithmLatentTbInfectionModel,
        },
        {
          provide: getModelToken('AlgorithmCgcIntervention'),
          useValue: mockAlgorithmCgcInterventionModel,
        },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        {
          provide: LeaderBoardService,
          useValue: mockLeaderBoardService,
        },
      ],
    }).compile();

    service = module.get<SubscriberActivityService>(SubscriberActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create subscriber activities using all supported modules with correct model calls', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const platform = 'mobile-app';
      const ipAddress = '127.0.0.1';

      const modules = [
        { name: 'Diagnosis Algorithm', model: mockAlgorithmDiagnosisModel },
        { name: 'Treatment Algorithm', model: mockAlgorithmTreatmentModel },
        { name: 'NTEP Intervention', model: mockAlgorithmCgcInterventionModel },
        {
          name: 'Guidance on ADR',
          model: mockAlgorithmGuidanceOnAdverseDrugReactionModel,
        },
        {
          name: 'Differentiated Care Of TB Patients',
          model: mockAlgorithmDifferentialCareModel,
        },
        {
          name: 'TB Preventive Treatment',
          model: mockAlgorithmLatentTbInfectionModel,
        },
      ];

      const moduleUsage = modules.map((mod, i) => ({
        module: mod.name,
        sub_module_id: new mongoose.Types.ObjectId().toHexString(),
        activity_type: 'viewed',
        time: (i + 1) * 10,
      }));

      const dto = {
        module: 'App Usage',
        userId,
        platform,
        ipAddress,
        payload: { moduleUsage },
      };

      // Set up mocks
      for (const mod of modules) {
        mod.model.findById.mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({ timeSpent: 100 }),
        });
      }

      mockSubscriberActivityModel.create.mockResolvedValue({
        _id: 'createdId',
      });

      const result = await service.create(dto as any);

      for (const mod of modules) {
        expect(mod.model.findById).toHaveBeenCalled();
      }

      expect(mockSubscriberActivityModel.create).toHaveBeenCalledTimes(6);

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: {
          _id: 'createdId',
        },
      });
    });
    it('should update existing user app version record for mobile-app', async () => {
      const userId = new mongoose.Types.ObjectId('6666c830eb18953046b1b56b');
      const dto = {
        module: 'appVersion',
        userId,
        platform: 'mobile-app',
        ipAddress: '127.0.0.1',
        action: 'version==2.5.1',
      };

      const mockVersionDoc = { _id: 'existingId' };

      mockSubscriberActivityModel.create.mockResolvedValueOnce({
        _id: 'activityId',
      });
      mockUserAppVersionModel.findOne.mockResolvedValueOnce(mockVersionDoc);
      mockUserAppVersionModel.updateOne.mockResolvedValueOnce({
        modifiedCount: 1,
      });

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ name: 'admin' }),
      });

      const mockUserApVersion = {
        userId: userId,
        userName: 'admim',
        appVersion: '2.3',
        currentPlatform: 'iPhone-app',
        hasIos: true,
        hasAndroid: false,
        hasWeb: false,
      };

      mockUserAppVersionModel.create(mockUserApVersion);

      const result = await service.create(dto as any);

      expect(mockSubscriberActivityModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'appVersion',
          action: 'version==2.5.1',
          platform: 'mobile-app',
        }),
      );

      expect(mockUserAppVersionModel.findOne).toHaveBeenCalledWith({ userId });

      expect(mockUserAppVersionModel.updateOne).toHaveBeenCalledWith(
        { userId },
        {
          appVersion: '2.5.1',
          currentPlatform: 'mobile-app',
          hasAndroid: true,
        },
      );

      expect(mockUserAppVersionModel.create).toHaveBeenCalledWith(
        mockUserApVersion,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: { _id: 'activityId' },
      });
    });
  });

  describe('findAll', () => {
    it('should return Subscriber activity with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockSubscriberActivity = [
        { name: 'Subscriber Activity 1' },
        { name: 'Subscriber Activity 2' },
      ];
      const mockAdminUser = {
        _id: userId,
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue({});
      (aggregate as jest.Mock).mockResolvedValue(mockSubscriberActivity);

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(aggregate).toHaveBeenCalledWith(
        mockSubscriberActivityModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSubscriberActivity);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' };

      mockAdminUserModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException('Admin User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('subscriberActivityRecords', () => {
    it('should return enriched subscriber activity records with pagination', async () => {
      const mockAdminUserId = new mongoose.Types.ObjectId().toString();
      const mockSubscriberIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      const mockAdminUser = {
        _id: mockAdminUserId,
        name: 'Test Admin',
        role: 'admin',
        state: new mongoose.Types.ObjectId(),
        district: new mongoose.Types.ObjectId(),
        isAllState: false,
        isAllDistrict: false,
      };

      const paginationDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        actions: null,
        stateId: null,
        districtId: null,
        blockId: null,
        countries: null,
        cadreId: null,
        healthFacilityId: null,
        name: null,
        phoneNo: null,
        email: null,
        userIdFilter: mockSubscriberIds.map((id) => id.toString()),
      };

      const mockSubscribers = mockSubscriberIds.map((id) => ({
        _id: id,
        name: 'User',
        email: 'test@example.com',
        phoneNo: '9999999999',
        countryId: new mongoose.Types.ObjectId(),
        stateId: new mongoose.Types.ObjectId(),
        districtId: new mongoose.Types.ObjectId(),
        blockId: new mongoose.Types.ObjectId(),
        healthFacilityId: new mongoose.Types.ObjectId(),
        cadreId: new mongoose.Types.ObjectId(),
      }));

      const mockActivities = mockSubscribers.map((user, i) => ({
        _id: new mongoose.Types.ObjectId(),
        module: 'testModule',
        action: `Action ${i}`,
        userId: user._id,
        toObject: () => ({
          _id: `record-${i}`,
          userId: user._id,
          module: 'testModule',
          action: `Action ${i}`,
        }),
      }));

      // Mock adminUserModel
      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });

      // Mock filterService
      mockFilterService.filter.mockResolvedValue({ mock: 'query' });

      // ✅ Chainable mock for .find()
      const mockFindQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockActivities),
        // exec: jest.fn().mockResolvedValue(mockActivities),
      };
      mockSubscriberActivityModel.find.mockReturnValue(mockFindQuery);

      // Mock countDocuments
      mockSubscriberActivityModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockActivities.length),
      });

      // Mock subscriberModel
      mockSubscriberModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSubscribers),
        }),
      });

      // Mock all location/cadre models
      mockCountryModel.find.mockResolvedValue([
        { _id: mockSubscribers[0].countryId, title: 'India' },
      ]);
      mockStateModel.find.mockResolvedValue([
        { _id: mockSubscribers[0].stateId, title: 'Karnataka' },
      ]);
      mockDistrictModel.find.mockResolvedValue([
        { _id: mockSubscribers[0].districtId, title: 'Bangalore' },
      ]);
      mockBlockModel.find.mockResolvedValue([
        { _id: mockSubscribers[0].blockId, title: 'Block A' },
      ]);
      mockHealthFacilityModel.find.mockResolvedValue([
        {
          _id: mockSubscribers[0].healthFacilityId,
          healthFacilityCode: 'HFC-001',
        },
      ]);
      mockCadreModel.find.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue([
            { _id: mockSubscribers[0].cadreId, title: 'Doctor' },
          ]),
      });

      const result = await service.subscriberActivityRecords(
        paginationDto as any,
        mockAdminUserId,
      );

      expect(result.status).toBe(true);
      expect(result.data.list).toHaveLength(mockActivities.length);
      expect(result.data.totalItems).toBe(mockActivities.length);
      expect(result.data.totalPages).toBe(1);
    });
  });

  describe('getAllActions', () => {
    it('Should Return all unique actions', async () => {
      mockSubscriberActivityModel.distinct.mockReturnValue([
        { action: 'payload' },
        { action: 'design' },
      ]);
      const result = await service.getAllActions();

      expect(mockSubscriberActivityModel.distinct).toHaveBeenCalledWith(
        'action',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Activity fetch Successfully',
        data: [{ action: 'payload' }, { action: 'design' }],
      });
    });
  });

  describe('getAllSubscriberActivity', () => {
    it('should return Subscriber Activity result data', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      const mockAdminUser = {
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      const mockPaginationDto: any = {
        state: '',
        district: '',
        cadre: '',
        country: '',
      };

      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];

      const mockAggregatedData = [
        {
          name: 'Test User',
          phoneNo: '1234567890',
          email: 'test@example.com',
          action: 'Login',
          createdAt: '2024-01-01 10:00:00',
        },
      ];

      // Mock findById().select()
      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });

      // Mock subscriberModel.find().select().lean()
      mockSubscriberModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUsers),
        }),
      });

      // Mock aggregate().exec()
      mockSubscriberActivityModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregatedData),
      });

      const result = await service.getAllSubscriberActivity(
        mockPaginationDto,
        mockUserId,
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockSubscriberModel.find).toHaveBeenCalled(); // Can also test called with proper userFilter
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Activity fetch Successfully',
        data: mockAggregatedData,
      });
    });
  });

  describe('getAllActivites', () => {
    it('should return task progress grouped by level', async () => {
      const mockUserId = '6440e6a7e8bc4c23f8d4a9ab';

      // Mock Leaderboard tasks grouped by level
      const mockUserTask = {
        data: [
          {
            level: 1,
            tasks: [
              {
                badge_name: 'Getting Started',
                chatbotUsageCount: 5,
                appOpenedCount: 10,
                kbaseCompletion: 2,
                'Read Article': 3,
              },
            ],
          },
        ],
      };

      // Mock subscriber activities
      const mockUserActivity = [
        { module: 'Knowledge', action: 'Chat Keyword Fetched', count: 3 },
        { module: 'Home', action: 'user_home_page_visit', count: 5 },
        { module: 'KBase', action: 'Kbase Course Fetched', count: 1 },
        { module: 'Learning', action: 'Read Article', count: 2 },
      ];

      // Mock the leaderboard service
      mockLeaderBoardService.getTasksGroupedByLevel.mockResolvedValue(
        mockUserTask,
      );

      // Mock the subscriber activity aggregation
      mockSubscriberActivityModel.aggregate.mockResolvedValue(mockUserActivity);

      const result = await service.getAllActivites(mockUserId);

      expect(mockLeaderBoardService.getTasksGroupedByLevel).toHaveBeenCalled();
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith([
        { $match: { userId: new mongoose.Types.ObjectId(mockUserId) } },
        {
          $group: {
            _id: {
              module: '$module',
              action: '$action',
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            module: '$_id.module',
            action: '$_id.action',
            count: 1,
          },
        },
      ]);

      expect(result).toEqual({
        status: true,
        message: 'Task progress fetched successfully',
        data: [
          {
            level: 1,
            taskProgress: [
              {
                badge_name: 'Getting Started',
                progress: [
                  { action: 'Chat Keyword Fetched', progress: '3/5' },
                  { action: 'user_home_page_visit', progress: '5/10' },
                  { action: 'Kbase Course Fetched', progress: '1/2' },
                  { action: 'Read Article', progress: '2/3' },
                ],
              },
            ],
          },
        ],
      });
    });
  });
});
