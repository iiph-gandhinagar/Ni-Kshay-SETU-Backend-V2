import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { ProAssessmentAggregate } from '../common/pagination/proAssessmentAggregation.service';
import { ProAssessmentResponseService } from './pro-assessment-response.service';
jest.mock('../common/pagination/proAssessmentAggregation.service', () => ({
  ProAssessmentAggregate: jest.fn(),
}));
const mockProAssessmentModel = {
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
  aggregate: jest.fn().mockReturnThis(),
};
const mockSubscriberModel = {
  findOne: jest.fn(),
};

const mockAdminUserModel = {
  findById: jest.fn(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};
const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('ProAssessmentResponseService', () => {
  let service: ProAssessmentResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProAssessmentResponseService,
        {
          provide: getModelToken('ProAssessmentResponse'),
          useValue: mockProAssessmentModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<ProAssessmentResponseService>(
      ProAssessmentResponseService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return Pro Assessment with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockProAssessment = [
        { name: 'Pro Assessment 1' },
        { name: 'Pro Assessment 2' },
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
      (ProAssessmentAggregate as jest.Mock).mockResolvedValue(
        mockProAssessment,
      );

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(ProAssessmentAggregate).toHaveBeenCalledWith(
        mockProAssessmentModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockProAssessment);
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
  describe('proAssessmentCsv', () => {
    it('should return assessment result data', async () => {
      const mockUserId = '12345';
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
      mockProAssessmentModel.exec.mockResolvedValue(mockAggregatedData);

      const result = await service.proAssessmentCsv(mockPaginationDto, '12345');

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockFilterService.filter).toHaveBeenCalledWith({
        ...mockPaginationDto,
        adminStateId: 'state123',
        adminDistrictId: 'district123',
      });

      expect(mockProAssessmentModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Result Fetched Successfully',
        data: mockAggregatedData,
      });
    });
  });
});
