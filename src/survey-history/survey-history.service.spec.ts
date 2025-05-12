import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { surveyAggregation } from '../common/pagination/surveyAggregation.service';
import { SurveyHistoryService } from './survey-history.service';

const mockSurveyHistoryModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  surveyAggregation: jest.fn(),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn().mockReturnThis(),
};
jest.mock('../common/pagination/surveyAggregation.service', () => ({
  surveyAggregation: jest.fn(),
}));
const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
const mockAdminUserModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};
const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};
describe('SurveyHistoryService', () => {
  let service: SurveyHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyHistoryService,
        {
          provide: getModelToken('SurveyHistory'),
          useValue: mockSurveyHistoryModel,
        },
        {
          provide: getModelToken('AdminUser'),
          useValue: mockAdminUserModel,
        },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<SurveyHistoryService>(SurveyHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Survey History', async () => {
      const createSurveyHistoryDto = {
        id: 1,
        userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        surveyId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        questionAnswer: [{ surveyQuestionId: '1', answer: 'survey history' }],
      };
      const mockSurveyHistory = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createSurveyHistoryDto,
      };
      mockSurveyHistoryModel.create.mockResolvedValue(mockSurveyHistory);

      const result = await service.create(
        createSurveyHistoryDto,
        '6666c830eb18953046b1b56b',
      );
      console.log('result--->', result);
      expect(mockSurveyHistoryModel.create).toHaveBeenCalledWith(
        createSurveyHistoryDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey History Created successfully',
        data: mockSurveyHistory,
      });
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
      const mockSurveyHistory = [
        { name: 'Survey History 1' },
        { name: 'Survey History 2' },
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
      (surveyAggregation as jest.Mock).mockResolvedValue(mockSurveyHistory);

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(surveyAggregation).toHaveBeenCalledWith(
        mockSurveyHistoryModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSurveyHistory);
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

  describe('surveyHistoryCsv', () => {
    it('should return assessment result data', async () => {
      const mockQuery = { 'userId.name': /test/i };

      const mockPaginationDto: any = {
        state: '',
        district: '',
        cadre: '',
        country: '',
      };

      const mockAggregatedData = [{ name: 'Test User', totalMarks: 20 }];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockSurveyHistoryModel.exec.mockResolvedValue(mockAggregatedData);

      const result = await service.surveyHistoryCsv(mockPaginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith({
        ...mockPaginationDto,
      });

      expect(mockSurveyHistoryModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey History fetch successfully',
        data: mockAggregatedData,
      });
    });
  });
});
