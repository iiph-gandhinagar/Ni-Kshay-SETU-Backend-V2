import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { UserAppVersionService } from './user-app-version.service';

const mockUserAppVersionModel = {
  find: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};
const mockFilterService = {
  filter: jest.fn().mockResolvedValue({}),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('UserAppVersionService', () => {
  let service: UserAppVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAppVersionService,
        {
          provide: getModelToken('UserAppVersion'),
          useValue: mockUserAppVersionModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<UserAppVersionService>(UserAppVersionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return User App Version with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockUserAppVersions = [
        { name: 'User App Version 1' },
        { name: 'User App Version 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUserAppVersions),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockUserAppVersionModel.find.mockReturnValue(mockQuery);
      mockUserAppVersionModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockUserAppVersions,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockUserAppVersionModel.find).toHaveBeenCalled();
      expect(mockUserAppVersionModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('getAllUserVersion', () => {
    it('should return a User App Version by ID', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockVersionData = [
        {
          id: '1',
          userId: {
            name: 'John Doe',
            email: 'john@example.com',
            phoneNo: '1234567890',
          },
          userName: 'John Doe',
          appVersion: '8.1',
          currentPlatform: 'ios',
          hasIos: true,
          hasAndroid: false,
          hasWeb: false,
        },
      ];
      const mockQuery = { hasIos: true };
      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockUserAppVersionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVersionData),
      });

      const result = await service.getAllUserVersion(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockUserAppVersionModel.find).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Get All User Version fetch successfully!!',
        data: mockVersionData,
      });
    });
  });
});
