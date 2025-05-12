import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { feedbackAggregation } from '../common/pagination/feedbackAggregation.service';
import { CreateFeedbackHistoryDto } from './dto/create-feedback-history.dto';
import { FeedbackHistoryService } from './feedback-history.service';

const mockFeedbackHistoryModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn(),
};
const mockAdminUserModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ category: '1' }),
    }),
  }),
};

const mockFeedbackModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ category: '1' }),
    }),
  }),
};

const mockSubscriberModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({ _id: 'user123' }), // ✅ Correct data
  }),
  updateOne: jest.fn().mockResolvedValue({}),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

jest.mock('../common/pagination/feedbackAggregation.service', () => ({
  feedbackAggregation: jest.fn(),
}));

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('FeedbackHistoryService', () => {
  let service: FeedbackHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackHistoryService,
        {
          provide: getModelToken('FeedbackHistory'),
          useValue: mockFeedbackHistoryModel,
        },
        {
          provide: getModelToken('AdminUser'),
          useValue: mockAdminUserModel,
        },
        { provide: getModelToken('Feedback'), useValue: mockFeedbackModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<FeedbackHistoryService>(FeedbackHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create feedback history successfully', async () => {
      const createFeedbackHistoryDto: CreateFeedbackHistoryDto = {
        ratings: [
          {
            id: '6666c830eb18953046b1b56b',
            rating: 5,
            skip: false,
          },
        ],
        review: 'Great service!',
      };
      const userId = '6666c830eb18953046b1b56b';

      // Mock the subscriber model to return a valid subscriber
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(), // Allow chaining
        exec: jest.fn().mockResolvedValue({ _id: userId }), // Mock resolved value
      });
      mockSubscriberModel.updateOne.mockResolvedValue({});
      mockFeedbackHistoryModel.create.mockResolvedValue(
        createFeedbackHistoryDto,
      );

      const result = await service.create(createFeedbackHistoryDto, userId);
      console.log('result-->', result);
      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockSubscriberModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        {
          $push: {
            'userContext.feedbackHistory': {
              feedbackId: new mongoose.Types.ObjectId(
                '6666c830eb18953046b1b56b',
              ), // Expecting an ObjectId
              isCompleted: true,
              createdAt: expect.any(Date),
            },
          },
        },
      );
      expect(mockFeedbackHistoryModel.create).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'), // Expecting an ObjectId
        feedbackId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'), // Expecting an ObjectId
        ratings: 5,
        review: 'Great service!',
        skip: false,
      });
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Thank You For Your Response',
        [],
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Thank You For Your Response',
        data: [],
      });
    });

    it('should throw an error if subscriber is not found', async () => {
      const createFeedbackHistoryDto: CreateFeedbackHistoryDto = {
        ratings: [{ id: 'feedbackId1', rating: 5, skip: false }],
        review: 'Great service!',
      };
      const userId = 'userId1';

      // Mock the subscriber model to return null (not found)
      mockSubscriberModel.findById.mockResolvedValue(null);

      await expect(
        service.create(createFeedbackHistoryDto, userId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'feedback issue!',
            errors: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if there is an issue during feedback creation', async () => {
      const createFeedbackHistoryDto: CreateFeedbackHistoryDto = {
        ratings: [{ id: 'feedbackId1', rating: 5, skip: false }],
        review: 'Great service!',
      };
      const userId = 'userId1';

      // Mock the subscriber model to return a valid subscriber
      mockSubscriberModel.findById.mockResolvedValue({ _id: userId });
      mockSubscriberModel.updateOne.mockResolvedValue({});
      mockFeedbackHistoryModel.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.create(createFeedbackHistoryDto, userId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'feedback issue!',
            details: 'Database error',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return Survey History with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockFeedbackHistory = [
        { name: 'Feedback History 1' },
        { name: 'Feedback History 2' },
      ];
      const mockAdminUser = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        state: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        district: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        isAllState: false,
        isAllDistrict: false,
      };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue({});
      (feedbackAggregation as jest.Mock).mockResolvedValue(mockFeedbackHistory);

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(feedbackAggregation).toHaveBeenCalledWith(
        mockFeedbackHistoryModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockFeedbackHistory);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null), // Simulating no user found
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException('Admin User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('feedbackHistoryCsv', () => {
    it('should return feedback history successfully', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = {}; // Mock the query that would be returned from the filter service
      const mockFeedbackHistory = [
        {
          _id: '1',
          feedbackId: 'feedbackId1',
          ratings: 5,
          review: 'Great service!',
          createdAt: new Date(),
          userId: {
            name: 'John Doe',
            phoneNo: '1234567890',
            email: 'john@example.com',
            country: { title: 'India' },
            state: { title: 'Maharashtra' },
            cadre: { title: 'Cadre 1' },
            district: { title: 'District 1' },
            block: { title: 'Block 1' },
          },
        },
      ];

      // Mock the filter service to return a query
      mockFilterService.filter.mockResolvedValue(mockQuery);
      // Mock the aggregation to return the mock feedback history
      mockFeedbackHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFeedbackHistory),
      });

      const result = await service.feedbackHistoryCsv(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockFeedbackHistoryModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback Histories fetch successfully',
        data: mockFeedbackHistory,
      });
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Feedback Histories fetch successfully',
        mockFeedbackHistory,
      );
    });

    it('should return an empty array if no feedback history is found', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = {}; // Mock the query that would be returned from the filter service

      // Mock the filter service to return a query
      mockFilterService.filter.mockResolvedValue(mockQuery);
      // Mock the aggregation to return an empty array
      mockFeedbackHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.feedbackHistoryCsv(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockFeedbackHistoryModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback Histories fetch successfully',
        data: [],
      });
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Feedback Histories fetch successfully',
        [],
      );
    });

    it('should throw an error if aggregation fails', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = {}; // Mock the query that would be returned from the filter service

      // Mock the filter service to return a query
      mockFilterService.filter.mockResolvedValue(mockQuery);
      // Mock the aggregation to throw an error
      mockFeedbackHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Aggregation error')),
      });

      await expect(service.feedbackHistoryCsv(paginationDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Aggregation error',
            details: 'Aggregation error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
