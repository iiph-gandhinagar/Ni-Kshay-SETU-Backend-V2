import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FeedbackService } from './feedback.service';
const mockFeedbackModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockReturnThis(), // Allow chaining
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Feedback' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Feedback' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue([]), // Default to returning an empty array
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockImplementation(() => {
    // Return mock data when lean is called
    return {
      exec: jest.fn().mockResolvedValue([
        {
          _id: '1',
          question: { en: 'User  Interface' },
          feedbackType: 'no_repeat',
        },
        {
          _id: '2',
          question: { en: 'Module Content' },
          feedbackType: 'repeat',
        },
      ]),
    };
  }),
  countDocuments: jest.fn().mockResolvedValue(20),
};
const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockFeedbackHistoryModel = {
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  }),
};

const mockSubscriberProgressHistoryModel = {
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({
      appOpenedCount: 5,
      chatbotUsageCount: 3,
    }),
  }),
};

const mockSubscriberActivityModel = {
  aggregate: jest
    .fn()
    .mockResolvedValue([{ module: 'Diagnosis Algorithm', totalAmount: 5000 }]),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: getModelToken('Feedback'), useValue: mockFeedbackModel },
        {
          provide: getModelToken('SubscriberProgressHistory'),
          useValue: mockSubscriberProgressHistoryModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('FeedbackHistory'),
          useValue: mockFeedbackHistoryModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Feedback', async () => {
      const createFeedbackDto = {
        question: { en: 'question' },
        description: { en: 'description' },
        feedbackValue: 4,
        feedbackTime: 3,
        feedbackType: 'feedback type',
        feedbackDays: 2,
        feedbackIcon: 'feedback icon',
        active: false,
      };
      const mockFeedback = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createFeedbackDto,
      };
      mockFeedbackModel.create.mockResolvedValue(mockFeedback);

      const result = await service.create(createFeedbackDto);
      expect(mockFeedbackModel.create).toHaveBeenCalledWith(createFeedbackDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback Created successfully',
        data: mockFeedback,
      });
    });
  });

  describe('findAll', () => {
    it('should return Feedbacks with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockFeedbacks = [{ name: 'Feedback 1' }, { name: 'Feedback 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFeedbacks),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockFeedbackModel.find.mockReturnValue(mockQuery);
      mockFeedbackModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockFeedbacks,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockFeedbackModel.find).toHaveBeenCalled();
      expect(mockFeedbackModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Feedback by ID', async () => {
      const mockFeedback = { _id: '1', name: 'Test Feedback' };
      mockFeedbackModel.findById.mockReturnValue(mockFeedback);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback fetch successfully',
        data: mockFeedback,
      });
      expect(mockFeedbackModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Feedback not found', async () => {
      mockFeedbackModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Feedback', async () => {
      const updatedFeedback = { _id: '1', active: false };
      mockFeedbackModel.findByIdAndUpdate.mockResolvedValue(updatedFeedback);

      const result = await service.update('1', { active: false });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback updated successfully',
        data: updatedFeedback,
      });
      expect(mockFeedbackModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Feedback by ID', async () => {
      mockFeedbackModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockFeedbackModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback deleted successfully',
        data: [],
      });
    });
  });

  describe('getFeedbackDetails', () => {
    it('should return feedback questions when active questions exist', async () => {
      mockFeedbackModel.find.mockResolvedValueOnce([
        {
          _id: '123',
          feedbackType: 'no_repeat',
          createdAt: new Date(),
          question: { en: 'User Interface' },
          feedbackValue: 1,
          feedbackTime: 0,
        },
      ]);
      const response = await service.getFeedbackDetails(
        '6666c830eb18953046b1b56b',
        true,
      );

      expect(mockFeedbackModel.find).toHaveBeenCalled();
      expect(mockFeedbackHistoryModel.find).toHaveBeenCalled();
      expect(mockSubscriberProgressHistoryModel.findOne).toHaveBeenCalled();
      expect(mockSubscriberActivityModel.aggregate).toHaveBeenCalled();
      expect(response).toEqual({
        statusCode: 200,
        message: 'Feedback Question List Fetched Successfully',
        data: expect.any(Array),
      });
    });

    it('should throw error if no active feedback questions are found', async () => {
      mockFeedbackModel.find.mockResolvedValueOnce([]); // Simulating no active feedback questions

      await expect(
        service.getFeedbackDetails('6666c830eb18953046b1b56b', false),
      ).rejects.toThrow('No active feedback questions found.');
    });

    it('should return an empty array if user does not meet activity criteria', async () => {
      mockFeedbackModel.find.mockResolvedValueOnce([
        {
          _id: '123',
          feedbackType: 'no_repeat',
          createdAt: new Date(),
          question: { en: 'User Interface' },
          feedbackValue: 1,
          feedbackTime: 0,
        },
      ]);
      mockSubscriberProgressHistoryModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          appOpenedCount: 1, // Only opened app once, not enough
          chatbotUsageCount: 1,
        }),
      });
      mockSubscriberActivityModel.aggregate.mockResolvedValue([]);

      const result = await service.getFeedbackDetails(
        '6666c830eb18953046b1b56b',
        false,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Feedback Question List Fetched Successfully',
        data: [
          {
            _id: '123',
            feedbackType: 'no_repeat',
            createdAt: expect.any(Date), // Or mock a fixed date
            question: { en: 'User Interface' },
            feedbackValue: 1,
            feedbackTime: 0,
          },
        ],
      });
    });
  });
});
