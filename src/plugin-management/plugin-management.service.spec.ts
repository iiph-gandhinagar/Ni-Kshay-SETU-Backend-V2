import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PluginManagementService } from './plugin-management.service';
const mockPluginManagementModel = {
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
describe('PluginManagementService', () => {
  let service: PluginManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginManagementService,
        {
          provide: getModelToken('PluginManagement'),
          useValue: mockPluginManagementModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<PluginManagementService>(PluginManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a plugin-management', async () => {
      const createPluginManagementDto = {
        cadreType: 'State_Level',
        cadreId: [
          new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
          new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ],
        isAllCadre: false,
        title: 'plugin-management',
        validationField: 'cadreId',
      };
      const mockPluginManagement = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createPluginManagementDto,
      };
      mockPluginManagementModel.create.mockResolvedValue(mockPluginManagement);

      const result = await service.create(createPluginManagementDto);
      expect(mockPluginManagementModel.create).toHaveBeenCalledWith(
        createPluginManagementDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Plugin management Created successfully',
        data: mockPluginManagement,
      });
    });
  });

  describe('findAll', () => {
    it('should return Plugin-management with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockPluginManagements = [
        { name: 'Plugin Management 1' },
        { name: 'Plugin Management 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPluginManagements),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockPluginManagementModel.find.mockReturnValue(mockQuery);
      mockPluginManagementModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockPluginManagements,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockPluginManagementModel.find).toHaveBeenCalled();
      expect(mockPluginManagementModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Plugin management by ID', async () => {
      const mockBlock = { _id: '1', name: 'Test Plugin management' };
      mockPluginManagementModel.findById.mockReturnValue(mockBlock);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Plugin management fetch successfully',
        data: mockBlock,
      });
      expect(mockPluginManagementModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Pugin Managements not found', async () => {
      mockPluginManagementModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Plugin management fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Plugin Management', async () => {
      const updatedPluginManagement = {
        _id: '1',
        title: 'Updated Plugin Management',
      };
      mockPluginManagementModel.findByIdAndUpdate.mockResolvedValue(
        updatedPluginManagement,
      );

      const result = await service.update('1', {
        title: 'Updated Plugin Management',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Plugin management updated successfully',
        data: updatedPluginManagement,
      });
      expect(mockPluginManagementModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Plugin Management' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a block by ID', async () => {
      mockPluginManagementModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockPluginManagementModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Plugin management deleted successfully',
        data: [],
      });
    });
  });
});
