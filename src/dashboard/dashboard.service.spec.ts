import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { DashboardService } from './dashboard.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockEmailService = {
  balanceReminder: jest.fn().mockResolvedValue([]),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const mockProAssessmentResponseModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const mockSubscriberActivityModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
};

const mockSubscriberProgressHistoryModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockChatConversionModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockQueryModel = {
  findOne: jest.fn(),
};

const mockOldAssessmentResultModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

const cacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(), // <-- This is important
      ],
      providers: [
        DashboardService,
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('ProAssessmentResponse'),
          useValue: mockProAssessmentResponseModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('subscriberProgressHistory'),
          useValue: mockSubscriberProgressHistoryModel,
        },
        {
          provide: getModelToken('ChatConversion'),
          useValue: mockChatConversionModel,
        },
        { provide: getModelToken('Query'), useValue: mockQueryModel },
        {
          provide: getModelToken('OldAssessmentResult'),
          useValue: mockOldAssessmentResultModel,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscriberCounts', () => {
    it("should return today's subscriber count and hourly breakdown", async () => {
      const paginationDto = { type: 'today' };

      mockSubscriberModel.countDocuments.mockResolvedValue(5);
      mockSubscriberModel.aggregate.mockResolvedValue([
        { _id: '10', count: 2 },
        { _id: '11', count: 3 },
      ]);

      const result = await service.subscriberCounts(paginationDto);

      expect(mockSubscriberModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Object),
        }),
      );

      expect(mockSubscriberModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Counts Fetched Successfully!!',
        data: {
          todaysSubscriberCount: 5,
          todaysSubscriber: [
            { _id: '10', count: 2 },
            { _id: '11', count: 3 },
          ],
        },
      });
    });

    it('should return total subscriber count and monthly/daily breakdown', async () => {
      const paginationDto = {
        type: 'all',
        createdAt: {
          $gte: new Date('2023-01-01'),
          $lte: new Date('2023-12-31'),
        },
      };

      const mockQuery = { createdAt: paginationDto.createdAt };

      // Override buildQuery if it's not mocked already
      jest.spyOn(service as any, 'buildQuery').mockResolvedValue(mockQuery);

      mockSubscriberModel.countDocuments.mockResolvedValue(100);
      mockSubscriberModel.aggregate.mockResolvedValue([
        { _id: '2023-01', count: 10 },
        { _id: '2023-02', count: 20 },
      ]);

      const result = await service.subscriberCounts(paginationDto);

      expect(mockSubscriberModel.countDocuments).toHaveBeenCalledWith(
        mockQuery,
      );

      expect(mockSubscriberModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $match: mockQuery }),
        ]),
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber Counts Fetched Successfully!!',
        data: {
          totalSubscriberCount: 100,
          totalSubscriber: [
            { _id: '2023-01', count: 10 },
            { _id: '2023-02', count: 20 },
          ],
        },
      });
    });
  });

  describe('visitorCounts', () => {
    it('should return cached data if available', async () => {
      const mockQueryDto = { type: 'today' };
      const mockQueryResult = { test: 'cached' };

      cacheManager.get.mockResolvedValue(mockQueryResult);

      const result = await service.visitorCount(mockQueryDto);

      expect(cacheManager.get).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Visitor Counts Fetched Successfully!!',
        data: mockQueryResult,
      });
    });
    it("should return today's visitor count if not cached", async () => {
      const mockQueryDto = { type: 'today' };

      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      mockSubscriberActivityModel.aggregate
        .mockResolvedValueOnce([{ uniqueUsers: 12 }]) // First aggregate for count
        .mockResolvedValueOnce([{ _id: '08', count: 5 }]); // Second aggregate for grouping

      const result = await service.visitorCount(mockQueryDto);
      expect(cacheManager.get).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Visitor Counts Fetched Successfully!!',
        data: {
          todaysVisitorCount: 12,
          todaysVisitor: [{ _id: '08', count: 5 }],
        },
      });
    });
    it('should return total visitor count and grouped data when not today and query exists', async () => {
      const mockQueryDto = { type: 'monthly' };

      // Force a query to be returned by buildQueryByUserId
      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.abc': 123 });

      cacheManager.get.mockResolvedValue(null);

      mockSubscriberActivityModel.aggregate
        .mockResolvedValueOnce([{ totalCount: 25 }]) // visitor count
        .mockResolvedValueOnce([{ _id: '2025-04', count: 15 }]); // totalVisitor group

      const result = await service.visitorCount(mockQueryDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Visitor Counts Fetched Successfully!!',
        data: {
          totalVisitorCount: 25,
          totalVisitor: [{ _id: '2025-04', count: 15 }],
        },
      });
    });
    it('should return total visitor count without query when no query is returned', async () => {
      const mockQueryDto = { type: 'monthly' };

      jest.spyOn(service as any, 'buildQueryByUserId').mockResolvedValue(null);
      cacheManager.get.mockResolvedValue(null);

      mockSubscriberActivityModel.countDocuments.mockResolvedValue(100);
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { _id: '2025-04', count: 50 },
      ]);

      const result = await service.visitorCount(mockQueryDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Visitor Counts Fetched Successfully!!',
        data: {
          totalVisitorCount: 100,
          totalVisitor: [{ _id: '2025-04', count: 50 }],
        },
      });
    });
  });

  describe('assessmentCount', () => {
    it('should return today counts correctly', async () => {
      const mockDto = { type: 'today' };

      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockAssessmentResponseModel.countDocuments.mockResolvedValue(5);
      mockProAssessmentResponseModel.countDocuments.mockResolvedValue(3);
      mockAssessmentResponseModel.aggregate.mockResolvedValue([
        { _id: '09', count: 2 },
        { _id: '10', count: 3 },
      ]);
      mockProAssessmentResponseModel.aggregate.mockResolvedValue([
        { _id: '09', count: 1 },
        { _id: '11', count: 4 },
      ]);

      const result = await service.assessmentCount(mockDto);
      expect(result).toEqual({
        message: 'Assessment Graph Fetched Successfully!!',
        statusCode: 200,
        data: {
          todaysCompletedAssessment: 8,
          todaysAssessment: [
            { _id: '09', count: 3 },
            { _id: '10', count: 3 },
            { _id: '11', count: 4 },
          ],
        },
      });
    });

    it('should return aggregate counts when query is present', async () => {
      const mockDto = { type: 'month' };
      const query = { 'user.stateId': 'abc' };

      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue(query);
      mockAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { totalCount: 5 },
      ]); // totalCompletedAssessment
      mockProAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { totalCount: 3 },
      ]); // totalProCompletedAssessment
      mockOldAssessmentResultModel.aggregate.mockResolvedValueOnce([
        { totalCount: 2 },
      ]); // totalOldAssessment

      // Chart data
      mockAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-04', count: 3 },
      ]);
      mockProAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-04', count: 2 },
      ]);
      mockOldAssessmentResultModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-04', count: 1 },
      ]);

      const result = await service.assessmentCount(mockDto);
      expect(result).toEqual({
        data: {
          totalAssessment: [{ _id: '2025-04', count: 6 }],
          totalCompletedAssessment: 10,
        },
        message: 'Assessment Graph Fetched Successfully!!',
        statusCode: 200,
      });
    });

    it('should return overall counts when query is empty', async () => {
      const mockDto = { type: 'year' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});

      mockAssessmentResponseModel.countDocuments.mockResolvedValue(10);
      mockProAssessmentResponseModel.countDocuments.mockResolvedValue(5);
      mockOldAssessmentResultModel.countDocuments.mockResolvedValue(2);

      mockAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-01', count: 4 },
      ]);
      mockProAssessmentResponseModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-01', count: 3 },
      ]);
      mockOldAssessmentResultModel.aggregate.mockResolvedValueOnce([
        { _id: '2025-01', count: 2 },
      ]);

      const result = await service.assessmentCount(mockDto);

      expect(result).not.toBeNull();
      expect(result).toEqual({
        data: {
          totalAssessment: [{ _id: '2025-01', count: 9 }],
          totalCompletedAssessment: 17,
        },
        message: 'Assessment Graph Fetched Successfully!!',
        statusCode: 200,
      });
    });
  });

  describe('totalMinuteSpent', () => {
    it("should return today's minute spent", async () => {
      const dto = { type: 'today' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { points: 12.5 },
      ]);

      const result = await service.totalMinuteSpent(dto);

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          todaysMinuteSpent: { points: 12.5 },
        },
      });
    });

    it('should return total minute spent with fromDate in previous year', async () => {
      const dto = {
        type: 'custom',
        fromDate: '2022-01-01',
        toDate: '2022-12-31',
      };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.stateId': 'xyz' });

      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { points: 272820 },
      ]);

      const result = await service.totalMinuteSpent(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 272820 }],
        },
      });
    });

    it('should return total minute spent when query is present and same year', async () => {
      const dto = { type: 'custom', fromDate: new Date().toISOString() };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.districtId': 'abc' });

      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { points: 140 },
      ]);

      const result = await service.totalMinuteSpent(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 140 }],
        },
      });
    });

    it('should return total minute spent with empty query (default path)', async () => {
      const dto = { type: 'custom' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});

      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { points: 273000 },
      ]);

      const result = await service.totalMinuteSpent(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 273000 }],
        },
      });
    });
  });

  describe('screeningToolCount', () => {
    it("should return today's screening tool count", async () => {
      const dto = { type: 'today' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.countDocuments.mockResolvedValue(15);

      const result = await service.screeningToolCount(dto);

      expect(mockSubscriberActivityModel.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          todaysScreeningTool: 15,
        },
      });
    });

    it('should return screening tool count for a previous year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: '2022-01-01',
        toDate: '2022-12-31',
      };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.stateId': 'xyz' });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { totalCount: 20 },
      ]);

      const result = await service.screeningToolCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          screeningTool: 12085, // 20 + 12065
        },
      });
    });

    it('should return screening tool count for current year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: new Date().toISOString(),
      };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.districtId': 'abc' });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { totalCount: 100 },
      ]);

      const result = await service.screeningToolCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          screeningTool: 100,
        },
      });
    });

    it('should return screening tool count for empty query (default case)', async () => {
      const dto = { type: 'custom' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.countDocuments.mockResolvedValue(90);

      const result = await service.screeningToolCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          screeningTool: 12065 + 90,
        },
      });
    });
  });

  describe('chatbotCount', () => {
    it("should return today's chatbot usage count", async () => {
      const dto = { type: 'today' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.countDocuments.mockResolvedValue(8);

      const result = await service.chatbotCount(dto);

      expect(mockSubscriberActivityModel.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          todaysChatbotUsage: 8,
        },
      });
    });

    it('should return chatbot usage count for a previous year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: '2022-05-01',
      };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.stateId': 'abc' });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { totalCount: 30 },
      ]);

      const result = await service.chatbotCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          chatbotUsage: 17214 + 30,
        },
      });
    });

    it('should return chatbot usage count for current year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: new Date().toISOString(),
      };
      jest
        .spyOn(service, 'buildQueryByUserId')
        .mockResolvedValue({ 'user.districtId': 'xyz' });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { totalCount: 50 },
      ]);

      const result = await service.chatbotCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          chatbotUsage: 50,
        },
      });
    });

    it('should return chatbot usage count for empty query (default case)', async () => {
      const dto = { type: 'custom' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.countDocuments.mockResolvedValue(40);

      const result = await service.chatbotCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          chatbotUsage: 17214 + 40,
        },
      });
    });
  });

  describe('generalCount', () => {
    it("should return today's general counts", async () => {
      const dto = { type: 'today' };

      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});
      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce([
        { points: 10 },
      ]); // todaysMinuteSpent
      mockSubscriberActivityModel.countDocuments
        .mockResolvedValueOnce(5) // todaysScreeningTool
        .mockResolvedValueOnce(7); // todaysChatbotUsage

      const result = await service.generalCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          todaysMinuteSpent: [{ points: 10 }],
          todaysScreeningTool: 5,
          todaysChatbotUsage: 7,
        },
      });
    });

    it('should return general counts for previous year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: '2022-01-01',
      };

      const query = { 'user.stateId': 'abc' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue(query);

      mockSubscriberActivityModel.aggregate
        .mockResolvedValueOnce([{ points: 100 }]) // totalMinuteSpentResult
        .mockResolvedValueOnce([{ totalCount: 12 }]) // screeningToolResult
        .mockResolvedValueOnce([{ totalCount: 20 }]); // chatbotResult

      const result = await service.generalCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 100 }],
          screeningTool: 12065 + 12,
          chatbotUsage: 17214 + 20,
        },
      });
    });

    it('should return general counts for current year with query', async () => {
      const dto = {
        type: 'custom',
        fromDate: new Date().toISOString(),
      };

      const query = { 'user.blockId': 'xyz' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue(query);

      mockSubscriberActivityModel.aggregate
        .mockResolvedValueOnce([{ points: 120 }]) // totalMinuteSpentResult
        .mockResolvedValueOnce([{ totalCount: 5 }]) // screeningToolResult
        .mockResolvedValueOnce([{ totalCount: 6 }]); // chatbotResult

      const result = await service.generalCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 120 }],
          screeningTool: 5,
          chatbotUsage: 6,
        },
      });
    });

    it('should return default counts when query is empty', async () => {
      const dto = { type: 'custom' };
      jest.spyOn(service, 'buildQueryByUserId').mockResolvedValue({});

      mockSubscriberActivityModel.aggregate.mockResolvedValueOnce([
        { points: 200 },
      ]); // totalMinuteSpentResult

      mockSubscriberActivityModel.countDocuments
        .mockResolvedValueOnce(9) // screeningToolCount
        .mockResolvedValueOnce(11); // chatbotCountResult

      const result = await service.generalCount(dto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'General Counts Fetched Successfully!!',
        data: {
          totalMinuteSpent: [{ points: 200 }],
          screeningTool: 9 + 12065,
          chatbotUsage: 11 + 17214,
        },
      });
    });
  });

  describe('mapCount', () => {
    it('should fetch map count for base query (no filters)', async () => {
      const mockQuery = {};
      const totalCount = 100;
      const stateAggregation = [
        {
          StateName: 'Test State',
          stateId: '507f1f77bcf86cd799439011',
          TotalSubscriberCount: 40,
        },
      ];
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };

      jest.spyOn(service, 'buildQuery').mockResolvedValue(mockQuery);
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        totalCount,
      ); // total
      (mockSubscriberModel.aggregate as jest.Mock).mockResolvedValueOnce(
        stateAggregation,
      );
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        30,
      ); // national
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        10,
      ); // international
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        2,
      ); // today's count

      const result = await service.mapCount(paginationDto);

      expect(service.buildQuery).toHaveBeenCalled();
      expect(mockSubscriberModel.aggregate).toHaveBeenCalled();
      expect(mockSubscriberModel.countDocuments).toHaveBeenCalledTimes(4);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Map Count Fetched Successfully!!',
        data: {
          stateWiseCount: [
            {
              StateName: 'Test State',
              stateId: '507f1f77bcf86cd799439011',
              TotalSubscriberCount: 40,
              TodaysSubscriber: 2,
              Percentage: 40.0,
            },
          ],
          internationalLevelSubscriber: 10,
          nationalLevelSubscriber: 30,
        },
      });
    });

    it('should return empty stateWiseCount if buildQuery has districtId and no matching docs', async () => {
      const mockQuery = {
        districtId: '507f1f77bcf86cd799439012',
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        districtId: [mockQuery.districtId],
      };

      jest.spyOn(service, 'buildQuery').mockResolvedValue(mockQuery);
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        0,
      ); // total count
      (mockSubscriberModel.aggregate as jest.Mock).mockResolvedValueOnce([]);
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        0,
      ); // national
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        0,
      ); // international

      const result = await service.mapCount(paginationDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Map Count Fetched Successfully!!',
        data: {
          stateWiseCount: [],
          internationalLevelSubscriber: 0,
          nationalLevelSubscriber: 0,
        },
      });
    });

    it('should fetch using healthFacilityId when blockId is present', async () => {
      const mockQuery = {
        blockId: '507f1f77bcf86cd799439013',
      };
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        blockId: [mockQuery.blockId],
      };

      jest.spyOn(service, 'buildQuery').mockResolvedValue(mockQuery);
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        100,
      ); // total
      (mockSubscriberModel.aggregate as jest.Mock).mockResolvedValueOnce([
        {
          HealthFacilityName: 'HF1',
          healthFacilityId: '123456789',
          TotalSubscriberCount: 10,
        },
      ]);
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        5,
      ); // national
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        1,
      ); // international
      (mockSubscriberModel.countDocuments as jest.Mock).mockResolvedValueOnce(
        1,
      ); // today's count

      const result = await service.mapCount(paginationDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Map Count Fetched Successfully!!',
        data: {
          stateWiseCount: [
            {
              HealthFacilityName: 'HF1',
              healthFacilityId: '123456789',
              TotalSubscriberCount: 10,
              TodaysSubscriber: 1,
              Percentage: 10.0,
            },
          ],
          internationalLevelSubscriber: 1,
          nationalLevelSubscriber: 5,
        },
      });
    });
    it('should return stateWiseCount with today subscriber counts and percentages when no filters applied', async () => {
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' }; // simulate no filters
      const mockQuery = {};

      jest.spyOn(service, 'buildQuery').mockResolvedValue(mockQuery);
      mockSubscriberModel.countDocuments.mockResolvedValueOnce(100); // total count
      mockSubscriberModel.aggregate.mockResolvedValueOnce([
        {
          StateName: 'State1',
          stateId: '6666c830eb18953046b1b56b',
          TotalSubscriberCount: 40,
        },
        {
          StateName: 'State2',
          stateId: '6666c830eb18953046b1b56b',
          TotalSubscriberCount: 60,
        },
      ]);
      mockSubscriberModel.countDocuments.mockResolvedValue(10); // today's count

      const result = await service.mapCount(paginationDto);

      expect(service.buildQuery).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberModel.countDocuments).toHaveBeenCalled();
      expect(mockSubscriberModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Map Count Fetched Successfully!!',
        data: {
          stateWiseCount: [
            {
              Percentage: 40,
              StateName: 'State1',
              TodaysSubscriber: 10,
              TotalSubscriberCount: 40,
              stateId: '6666c830eb18953046b1b56b',
            },
            {
              Percentage: 60,
              StateName: 'State2',
              TodaysSubscriber: 10,
              TotalSubscriberCount: 60,
              stateId: '6666c830eb18953046b1b56b',
            },
          ],
          internationalLevelSubscriber: 10,
          nationalLevelSubscriber: 10,
        },
      });
    });
  });

  describe('cadreWiseGraph', () => {
    it('should return top 5 cadres with percentage calculation', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        stateId: null,
        districtId: null,
        blockId: null,
      };

      const mockAggregationResult = [
        {
          cadreId: 'cadre1',
          CadreName: 'Cadre A',
          CadreType: 'Type 1',
          TotalCadreCount: 30,
          Percentage: 60,
        },
        {
          cadreId: 'cadre2',
          CadreName: 'Cadre B',
          CadreType: 'Type 2',
          TotalCadreCount: 20,
          Percentage: 40,
        },
      ];

      mockSubscriberModel.aggregate.mockResolvedValue(mockAggregationResult);

      // Optionally mock buildQuery if it's in your service
      jest.spyOn(service, 'buildQuery' as any).mockResolvedValue({});

      const result = await service.cadreWiseGraph(paginationDto);

      expect(mockSubscriberModel.aggregate).toHaveBeenCalled();
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Cadre Wise Subscriber Fetched Successfully!!',
        mockAggregationResult,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre Wise Subscriber Fetched Successfully!!',
        data: mockAggregationResult,
      });
    });
  });

  describe('moduleUsage', () => {
    it('should return module usage data correctly for last 30 days', async () => {
      const paginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        type: 'days',
        stateId: null,
        districtId: null,
        blockId: null,
      };

      const mockAggregationResult = [
        {
          ModuleName: 'Diagnosis Algorithm',
          ActivityCount: 15,
        },
        {
          ModuleName: 'Chatbot',
          ActivityCount: 10,
        },
      ];

      mockSubscriberActivityModel.aggregate.mockResolvedValue(
        mockAggregationResult,
      );

      jest.spyOn(service, 'buildQueryByUserId' as any).mockResolvedValue({});

      const result = await service.moduleUsage(paginationDto);

      expect(service['buildQueryByUserId']).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Module usage counts Fetched Successfully!!',
        data: mockAggregationResult,
      });
    });
    it('should return module usage data without date filter when type is not "days"', async () => {
      const paginationDto = {
        type: 'all',
        stateId: null,
        districtId: null,
        blockId: null,
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockAggregationResult = [
        {
          ModuleName: 'TB Preventive Treatment',
          ActivityCount: 20,
        },
      ];

      mockSubscriberActivityModel.aggregate.mockResolvedValue(
        mockAggregationResult,
      );

      jest.spyOn(service, 'buildQueryByUserId' as any).mockResolvedValue({});

      const result = await service.moduleUsage(paginationDto);

      expect(service['buildQueryByUserId']).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Module usage counts Fetched Successfully!!',
        mockAggregationResult,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Module usage counts Fetched Successfully!!',
        data: mockAggregationResult,
      });
    });
    it('should handle error if aggregation fails', async () => {
      const paginationDto = {
        type: 'days',
        stateId: null,
        districtId: null,
        blockId: null,
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      jest.spyOn(service, 'buildQueryByUserId' as any).mockResolvedValue({});
      mockSubscriberActivityModel.aggregate.mockRejectedValue(
        new Error('Aggregation failed'),
      );

      await expect(service.moduleUsage(paginationDto)).rejects.toThrow(
        'Aggregation failed',
      );

      expect(service['buildQueryByUserId']).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('leaderboard', () => {
    it('should return cached leaderboard data if present in cache', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = { cadreType: 'NTG' };
      const mockCacheKey = `leaderBoard:${paginationDto.type}:${JSON.stringify(mockQuery)}`;
      const mockCachedData = [{ cadreType: 'NTG', levels: [] }];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      cacheManager.get.mockResolvedValue(mockCachedData);

      const result = await service.leaderboard(paginationDto);

      expect(cacheManager.get).toHaveBeenCalledWith(mockCacheKey);
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Leaderboard Fetched Successfully!!',
        mockCachedData,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Leaderboard Fetched Successfully!!',
        data: mockCachedData,
      });
    });
    it('should perform aggregation and cache leaderboard data if not cached', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTG' };
      const cacheKey = `leaderBoard:${paginationDto.type}:${JSON.stringify(mockQuery)}`;
      const mockAggregationResult = [
        {
          cadreType: 'NTG',
          levels: [{ levelName: 'Beginner', count: 5 }],
        },
      ];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      cacheManager.get.mockResolvedValue(null);
      mockSubscriberProgressHistoryModel.aggregate.mockResolvedValue(
        mockAggregationResult,
      );

      const result = await service.leaderboard(paginationDto);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockSubscriberProgressHistoryModel.aggregate).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        mockAggregationResult,
        30 * 60 * 1000,
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Leaderboard Fetched Successfully!!',
        mockAggregationResult,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Leaderboard Fetched Successfully!!',
        data: mockAggregationResult,
      });
    });
    it('should throw error if aggregation fails', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTG' };

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      cacheManager.get.mockResolvedValue(null);
      mockSubscriberProgressHistoryModel.aggregate.mockRejectedValue(
        new Error('Aggregation failed'),
      );

      await expect(service.leaderboard(paginationDto)).rejects.toThrow(
        'Aggregation failed',
      );
      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockSubscriberProgressHistoryModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('chatbot', () => {
    it('should fetch chatbot data with user query (with subscribers lookup)', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTG' };

      const chatbotAggResult = [{ question: 'Q1', count: 10 }];
      const chatbotLast30DaysAggResult = [{ question: 'Q1', count: 5 }];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      mockChatConversionModel.aggregate
        .mockResolvedValueOnce(chatbotAggResult) // first aggregation
        .mockResolvedValueOnce(chatbotLast30DaysAggResult); // second aggregation

      const result = await service.chatbot(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockChatConversionModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chatbot Count Fetched Successfully!!',
        data: {
          chatbot: chatbotAggResult,
          chatbotLast30Days: chatbotLast30DaysAggResult,
        },
      });
    });
    it('should fetch chatbot data without query (global)', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const chatbotAggResult = [{ question: 'Q2', count: 20 }];
      const chatbotLast30DaysAggResult = [{ question: 'Q2', count: 8 }];

      jest.spyOn(service as any, 'buildQueryByUserId').mockResolvedValue({});

      mockChatConversionModel.aggregate
        .mockResolvedValueOnce(chatbotAggResult)
        .mockResolvedValueOnce(chatbotLast30DaysAggResult);

      const result = await service.chatbot(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockChatConversionModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chatbot Count Fetched Successfully!!',
        data: {
          chatbot: chatbotAggResult,
          chatbotLast30Days: chatbotLast30DaysAggResult,
        },
      });
    });
    it('should throw error if chatbot aggregation fails', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      jest.spyOn(service as any, 'buildQueryByUserId').mockResolvedValue({});
      mockChatConversionModel.aggregate.mockRejectedValue(
        new Error('Aggregation failed'),
      );

      await expect(service.chatbot(paginationDto)).rejects.toThrow(
        'Aggregation failed',
      );
      expect(mockChatConversionModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('manageTb', () => {
    it('should return manageTb counts with filtered userIds', async () => {
      const paginationDto = {
        type: 'days',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTG' };
      const mockUserIds = [{ _id: 'user1' }, { _id: 'user2' }];

      jest.spyOn(service as any, 'buildQuery').mockResolvedValue(mockQuery);
      mockSubscriberModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUserIds),
      });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { _id: 'Open', count: 10 },
        { _id: 'Submit', count: 5 },
        { _id: 'Download', count: 3 },
      ]);

      const result = await service.manageTb(paginationDto);

      expect(service.buildQuery).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberModel.find).toHaveBeenCalledWith(
        { $and: [mockQuery] },
        { _id: 1 },
      );
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Manage Tb counts Fetched Successfully!!',
        data: { manageTb: expect.any(Array) },
      });
    });
    it('should return manageTb counts without filters (no userIds)', async () => {
      const paginationDto = { page: 1, limit: 10, fromDate: '', toDate: '' };
      jest.spyOn(service as any, 'buildQuery').mockResolvedValue({}); // empty query
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        { _id: 'Open', count: 12 },
        { _id: 'Download', count: 2 },
      ]);

      const result = await service.manageTb(paginationDto);

      expect(service.buildQuery).toHaveBeenCalledWith(paginationDto);
      expect(mockSubscriberModel.find).not.toHaveBeenCalled();
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Manage Tb counts Fetched Successfully!!',
        data: { manageTb: expect.any(Array) },
      });
    });
    it('should throw an error if aggregation fails', async () => {
      const paginationDto = { page: 1, limit: 10, fromDate: '', toDate: '' };
      jest.spyOn(service as any, 'buildQuery').mockResolvedValue({});
      mockSubscriberActivityModel.aggregate.mockRejectedValue(
        new Error('Aggregation error'),
      );

      await expect(service.manageTb(paginationDto)).rejects.toThrow(
        'Aggregation error',
      );
      expect(mockBaseResponse.sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('assessmentResponse', () => {
    it('should return assessment responses with filters applied', async () => {
      const paginationDto = {
        type: 'some-filter',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTG' };

      const mockAssessmentData = [
        { _id: '04-2024', totalSubmitted: 5 },
        { _id: '05-2024', totalSubmitted: 3 },
      ];
      const mockAssessmentLast30Days = [
        { _id: { year: 2024, month: 4 }, totalSubmitted: 2 },
      ];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      mockAssessmentResponseModel.aggregate
        .mockResolvedValueOnce(mockAssessmentData) // full assessment data
        .mockResolvedValueOnce(mockAssessmentLast30Days); // last 30 days

      const result = await service.assessmentResponse(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Report Fetched Successfully!!',
        data: {
          assessmentResponse: mockAssessmentData,
          assessmentResponseLast30Days: mockAssessmentLast30Days,
        },
      });
    });
    it('should return assessment responses without filters', async () => {
      const paginationDto = { page: 1, limit: 10, fromDate: '', toDate: '' };
      jest.spyOn(service as any, 'buildQueryByUserId').mockResolvedValue({});

      const mockAssessmentData = [
        { _id: { year: 2024, month: 3 }, totalSubmitted: 10 },
        { _id: { year: 2024, month: 4 }, totalSubmitted: 7 },
      ];
      const mockAssessmentLast30Days = [
        { _id: { year: 2024, month: 4 }, totalSubmitted: 3 },
      ];

      mockAssessmentResponseModel.aggregate
        .mockResolvedValueOnce(mockAssessmentData)
        .mockResolvedValueOnce(mockAssessmentLast30Days);

      const result = await service.assessmentResponse(paginationDto);

      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Report Fetched Successfully!!',
        data: {
          assessmentResponse: mockAssessmentData,
          assessmentResponseLast30Days: mockAssessmentLast30Days,
        },
      });
    });
    it('should throw an error if aggregation fails', async () => {
      const paginationDto = { page: 1, limit: 10, fromDate: '', toDate: '' };
      jest.spyOn(service as any, 'buildQueryByUserId').mockResolvedValue({});
      mockAssessmentResponseModel.aggregate.mockRejectedValueOnce(
        new Error('Aggregation error'),
      );

      await expect(service.assessmentResponse(paginationDto)).rejects.toThrow(
        'Aggregation error',
      );
      expect(mockBaseResponse.sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('proAssessmentGraph', () => {
    it('should return pro assessment response with filters applied', async () => {
      const paginationDto = {
        cadreType: 'NTEP',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTEP' };

      const mockGraphData = [
        { _id: '04-2024', totalSubmitted: 3 },
        { _id: '05-2024', totalSubmitted: 6 },
      ];
      const mockLast30DaysData = [
        { _id: { year: 2024, month: 5 }, totalSubmitted: 2 },
      ];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      mockProAssessmentResponseModel.aggregate
        .mockResolvedValueOnce(mockGraphData) // main graph
        .mockResolvedValueOnce(mockLast30DaysData); // last 30 days

      const result = await service.proAssessmentGraph(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockProAssessmentResponseModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Report Fetched Successfully!!',
        data: {
          proAssessmentResponse: mockGraphData,
          proAssessmentResponseLast30Days: mockLast30DaysData,
        },
      });
    });
    it('should return pro assessment response with filters applied', async () => {
      const paginationDto = {
        cadreType: 'NTEP',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTEP' };

      const mockGraphData = [
        { _id: '04-2024', totalSubmitted: 3 },
        { _id: '05-2024', totalSubmitted: 6 },
      ];
      const mockLast30DaysData = [
        { _id: { year: 2024, month: 5 }, totalSubmitted: 2 },
      ];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      mockProAssessmentResponseModel.aggregate
        .mockResolvedValueOnce(mockGraphData) // main graph
        .mockResolvedValueOnce(mockLast30DaysData); // last 30 days

      const result = await service.proAssessmentGraph(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockProAssessmentResponseModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Report Fetched Successfully!!',
        data: {
          proAssessmentResponse: mockGraphData,
          proAssessmentResponseLast30Days: mockLast30DaysData,
        },
      });
    });
    it('should return pro assessment response with filters applied', async () => {
      const paginationDto = {
        cadreType: 'NTEP',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockQuery = { cadreType: 'NTEP' };

      const mockGraphData = [
        { _id: '04-2024', totalSubmitted: 3 },
        { _id: '05-2024', totalSubmitted: 6 },
      ];
      const mockLast30DaysData = [
        { _id: { year: 2024, month: 5 }, totalSubmitted: 2 },
      ];

      jest
        .spyOn(service as any, 'buildQueryByUserId')
        .mockResolvedValue(mockQuery);
      mockProAssessmentResponseModel.aggregate
        .mockResolvedValueOnce(mockGraphData) // main graph
        .mockResolvedValueOnce(mockLast30DaysData); // last 30 days

      const result = await service.proAssessmentGraph(paginationDto);

      expect(service.buildQueryByUserId).toHaveBeenCalledWith(paginationDto);
      expect(mockProAssessmentResponseModel.aggregate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Report Fetched Successfully!!',
        data: {
          proAssessmentResponse: mockGraphData,
          proAssessmentResponseLast30Days: mockLast30DaysData,
        },
      });
    });
  });

  describe('appOpenedCount', () => {
    it('should return app opened count data for weekly type', async () => {
      const mockAggregationResult = [
        {
          range_3_to_5: [{ userCount: 2 }],
          range_5_to_7: [{ userCount: 3 }],
          range_7_to_9: [{ userCount: 1 }],
          range_gte_10: [{ userCount: 4 }],
        },
      ];

      // 4 weeks of data expected
      mockSubscriberActivityModel.aggregate.mockResolvedValue(
        mockAggregationResult,
      );

      const result = await service.appOpenedCount('week');

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Opened Counts Fetched Successfully!!',
        data: expect.any(Array),
      });

      const data = result.data;
      expect(data).toHaveLength(4);
      expect(data[0]).toHaveProperty('range3To5', 10); // 2+3+1+4
      expect(data[0]).toHaveProperty('range5To7', 8); // 3+1+4
      expect(data[0]).toHaveProperty('range7To9', 5); // 1+4
      expect(data[0]).toHaveProperty('rangeGte10', 4);
    });
    it('should return app opened count data for monthly type', async () => {
      const mockAggregationResult = [
        {
          range_3_to_5: [{ userCount: 2 }],
          range_5_to_7: [{ userCount: 3 }],
          range_7_to_9: [{ userCount: 1 }],
          range_gte_10: [{ userCount: 4 }],
        },
      ];

      // 4 months of data expected
      mockSubscriberActivityModel.aggregate.mockResolvedValue(
        mockAggregationResult,
      );

      const result = await service.appOpenedCount('month');

      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Opened Counts Fetched Successfully!!',
        data: expect.any(Array),
      });

      const data = result.data;
      expect(data).toHaveLength(4);
      expect(data[0]).toHaveProperty('range3To5', 10); // 2+3+1+4
      expect(data[0]).toHaveProperty('range5To7', 8); // 3+1+4
      expect(data[0]).toHaveProperty('range7To9', 5); // 1+4
      expect(data[0]).toHaveProperty('rangeGte10', 4);
    });

    it('should handle empty aggregation result gracefully', async () => {
      mockSubscriberActivityModel.aggregate.mockResolvedValue([
        {
          range_3_to_5: [],
          range_5_to_7: [],
          range_7_to_9: [],
          range_gte_10: [],
        },
      ]);

      const result = await service.appOpenedCount('week');

      const weekData = result.data[0];
      expect(weekData.range3To5).toBe(0);
      expect(weekData.range5To7).toBe(0);
      expect(weekData.range7To9).toBe(0);
      expect(weekData.rangeGte10).toBe(0);
    });
  });

  describe('balanceCheck', () => {
    it('should return balance details and NOT send reminder when balance >= 50', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { balance: { sms: 100 } },
      });

      const result = await service.balanceCheck();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.TEXTLOCAL_API_ENDPOINT}apikey=${process.env.TEXTLOCAL_API_KEY}`,
      );
      expect(mockEmailService.balanceReminder).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Balance Details',
        data: { balance: { sms: 100 } },
      });
    });

    it('should send reminder email if SMS balance is below 50', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { balance: { sms: 10 } },
      });

      const result = await service.balanceCheck();

      expect(mockEmailService.balanceReminder).toHaveBeenCalledWith(
        'mehulp@digiflux.io',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Balance Details',
        data: { balance: { sms: 10 } },
      });
    });

    it('should throw error if axios fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.balanceCheck()).rejects.toThrow('API Error');
      expect(mockEmailService.balanceReminder).not.toHaveBeenCalled();
    });
  });
});
