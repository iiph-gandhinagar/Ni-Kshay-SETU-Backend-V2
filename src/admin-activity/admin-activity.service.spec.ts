import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AdminActivityService } from './admin-activity.service';
const mockAdminActivityModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Admin Activity' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Admin Activity' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  select: jest.fn().mockReturnThis(),
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
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AdminActivityService', () => {
  let service: AdminActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminActivityService,
        {
          provide: getModelToken('AdminActivity'),
          useValue: mockAdminActivityModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AdminActivityService>(AdminActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Admin Activity', async () => {
      const createAdminActivityDto = {
        action: 'action',
        moduleName: 'module name',
        causerId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        payload: { en: 'payload' },
      };
      const mockActivity = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAdminActivityDto,
      };
      mockAdminActivityModel.create.mockResolvedValue(mockActivity);

      const result = await service.create(
        createAdminActivityDto,
        '6666c830eb18953046b1b56b',
      );
      expect(mockAdminActivityModel.create).toHaveBeenCalledWith(
        createAdminActivityDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin Activity created Successfully',
        data: mockActivity,
      });
    });
  });

  describe('findAll', () => {
    it('should return AdminActivity with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAdminActivities = [
        { name: 'AdminActivity 1' },
        { name: 'AdminActivity 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminActivities),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAdminActivityModel.find.mockReturnValue(mockQuery);
      mockAdminActivityModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAdminActivities,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAdminActivityModel.find).toHaveBeenCalled();
      expect(mockAdminActivityModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('getAllActivity', () => {
    it('should return all admin activity without pagination', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockActivities = [
        {
          causerId: {
            firstName: 'John',
            LastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      ];

      mockAdminActivityModel.find.mockReturnThis();
      mockAdminActivityModel.populate.mockReturnThis();
      mockAdminActivityModel.select.mockReturnThis();
      mockAdminActivityModel.exec.mockResolvedValue(mockActivities);

      const result = await service.getAllActivity(paginationDto);

      expect(mockAdminActivityModel.find).toHaveBeenCalled();
      expect(mockAdminActivityModel.populate).toHaveBeenCalledWith({
        path: 'causerId',
        select: 'firstName LastName email',
      });
      expect(mockAdminActivityModel.select).toHaveBeenCalledWith('-payload');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin Activity fetch successfully!',
        data: mockActivities,
      });
    });
  });
});
