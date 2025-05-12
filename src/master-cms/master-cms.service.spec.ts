import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { MasterCmsService } from './master-cms.service';
const mockMasterCmsModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Master cms' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Master cms' }),
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
describe('MasterCmsService', () => {
  let service: MasterCmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterCmsService,
        { provide: getModelToken('MasterCm'), useValue: mockMasterCmsModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<MasterCmsService>(MasterCmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Master cms', async () => {
      const createMasterCmDto = {
        description: { en: 'Master cms' },
        title: 'master cms',
      };
      const mockMasterCms = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createMasterCmDto,
      };
      mockMasterCmsModel.create.mockResolvedValue(mockMasterCms);

      const result = await service.create(createMasterCmDto);
      expect(mockMasterCmsModel.create).toHaveBeenCalledWith(createMasterCmDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Cms Created successfully',
        data: mockMasterCms,
      });
    });
  });

  describe('findAll', () => {
    it('should return Master cms with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockMasterCms = [
        { name: 'master cms 1' },
        { name: 'master cms 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockMasterCms),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockMasterCmsModel.find.mockReturnValue(mockQuery);
      mockMasterCmsModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockMasterCms,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockMasterCmsModel.find).toHaveBeenCalled();
      expect(mockMasterCmsModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Master cms by ID', async () => {
      const mockMasterCms = { _id: '1', name: 'Test Master cms' };
      mockMasterCmsModel.findById.mockReturnValue(mockMasterCms);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Cms fetch successfully',
        data: mockMasterCms,
      });
      expect(mockMasterCmsModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Master cms not found', async () => {
      mockMasterCmsModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Cms fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated master cms', async () => {
      const updatedBlock = { _id: '1', title: 'Updated master cms' };
      mockMasterCmsModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('1', { title: 'Updated master cms' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Cms updated successfully',
        data: updatedBlock,
      });
      expect(mockMasterCmsModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated master cms' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Master Cms by ID', async () => {
      mockMasterCmsModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockMasterCmsModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Cms deleted successfully',
        data: [],
      });
    });
  });
});
