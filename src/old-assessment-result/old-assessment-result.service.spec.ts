import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { OldAssessmentAggregate } from '../common/pagination/oldAssessmentAggregation.service';
import { OldAssessmentResultService } from './old-assessment-result.service';

const mockOldAssessmentModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  OldAssessmentAggregate: jest.fn(),
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
  aggregate: jest.fn().mockReturnThis(),
  distinct: jest.fn().mockReturnThis(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockAdminUserModel = {
  findById: jest.fn().mockReturnValue({}),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

jest.mock('../common/pagination/oldAssessmentAggregation.service', () => ({
  OldAssessmentAggregate: jest.fn(),
}));

describe('OldAssessmentResultService', () => {
  let service: OldAssessmentResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OldAssessmentResultService,
        {
          provide: getModelToken('OldAssessmentResult'),
          useValue: mockOldAssessmentModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<OldAssessmentResultService>(
      OldAssessmentResultService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue({});
      (OldAssessmentAggregate as jest.Mock).mockResolvedValue(
        mockSurveyHistory,
      );

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(OldAssessmentAggregate).toHaveBeenCalledWith(
        mockOldAssessmentModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSurveyHistory);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException('Admin User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllResponse', () => {
    it('should return assessment result data', async () => {
      const mockUserId = '123';
      const mockAdminUser = {
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      const mockQuery = { 'userId.name': /test/i };

      const mockPaginationDto: any = {
        state: '',
        district: '',
        cadre: '',
        country: '',
      };

      const mockAggregatedData = [{ name: 'Test User', totalMarks: 20 }];

      // Mock model behavior
      mockAdminUserModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockOldAssessmentModel.exec.mockResolvedValue(mockAggregatedData);

      const result = await service.getAllResponse(
        mockPaginationDto,
        mockUserId,
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockFilterService.filter).toHaveBeenCalledWith({
        ...mockPaginationDto,
        adminStateId: 'state123',
        adminDistrictId: 'district123',
      });

      expect(mockOldAssessmentModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Old User assessment Result Fetch Successfully',
        data: mockAggregatedData,
      });
    });
  });

  describe('getUniqueTitle', () => {
    it('should return unique title data', async () => {
      const mockTitles = ['Assessment 1', 'Assessment 2'];

      mockOldAssessmentModel.distinct.mockResolvedValue(mockTitles);
      const result = await service.getUniqueTitle();
      expect(mockOldAssessmentModel.distinct).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Uniques titles Drop Down',
        data: mockTitles,
      });
    });
  });
});
