import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AppManagementFlagService } from './app-management-flag.service';
const mockAppManagementModel = {
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
describe('AppManagementFlagService', () => {
  let service: AppManagementFlagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppManagementFlagService,
        {
          provide: getModelToken('AppManagementFlag'),
          useValue: mockAppManagementModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AppManagementFlagService>(AppManagementFlagService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a App Management', async () => {
      const createAppManagementDto = {
        variable: 'HOME_BANNER_TITLE',
        value: { en: 'Home Title' },
      };
      const mockAppManagement = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAppManagementDto,
      };
      mockAppManagementModel.create.mockResolvedValue(mockAppManagement);

      const result = await service.create(createAppManagementDto);
      expect(mockAppManagementModel.create).toHaveBeenCalledWith(
        createAppManagementDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Management created successfully',
        data: mockAppManagement,
      });
    });
  });

  describe('findAll', () => {
    it('should return App management with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAppManagements = [
        { name: 'AppManagement 1' },
        { name: 'AppManagement 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAppManagements),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAppManagementModel.find.mockReturnValue(mockQuery);
      mockAppManagementModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAppManagements,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAppManagementModel.find).toHaveBeenCalled();
      expect(mockAppManagementModel.countDocuments).toHaveBeenCalledWith({});
    });
  });
  describe('findOne', () => {
    it('should return a App Management by ID', async () => {
      const mockAppManagement = { _id: '1', name: 'Test App management' };
      mockAppManagementModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAppManagement),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Management fetch successfully',
        data: mockAppManagement,
      });
      expect(mockAppManagementModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if App Management not found', async () => {
      mockAppManagementModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Management fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated App Management', async () => {
      const updatedAppManagement = {
        _id: '1',
        variable: 'Updated AppManagement',
      };
      mockAppManagementModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedAppManagement),
      });

      const result = await service.update('1', {
        variable: 'Updated AppManagement',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'App Management updated successfully',
        data: updatedAppManagement,
      });
      expect(mockAppManagementModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { variable: 'Updated AppManagement' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a App management by ID', async () => {
      mockAppManagementModel.findOne.mockResolvedValueOnce(null);
      mockAppManagementModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockAppManagementModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Management deleted successfully',
        data: [],
      });
    });
  });
});
