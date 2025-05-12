import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { BlockService } from './block.service';

const mockBlockModel = {
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

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('BlockService', () => {
  let service: BlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<BlockService>(BlockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a block', async () => {
      const createBlockDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'block',
      };
      const mockBlock = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createBlockDto,
      };
      mockBlockModel.create.mockResolvedValue(mockBlock);

      const result = await service.create(createBlockDto);
      console.log('result--->', result);
      expect(mockBlockModel.create).toHaveBeenCalledWith(createBlockDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Block created successfully',
        data: mockBlock,
      });
    });
  });

  describe('findAll', () => {
    it('should return blocks with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockBlocks = [{ name: 'Block 1' }, { name: 'Block 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlocks),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockBlockModel.find.mockReturnValue(mockQuery);
      mockBlockModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockBlocks,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockBlockModel.find).toHaveBeenCalled();
      expect(mockBlockModel.countDocuments).toHaveBeenCalledWith([]);
    });
  });

  describe('findOne', () => {
    it('should return a block by ID', async () => {
      const mockBlock = { _id: '1', name: 'Test Block' };
      mockBlockModel.findById.mockReturnValue(mockBlock);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Block fetch successfully',
        data: mockBlock,
      });
      expect(mockBlockModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if block not found', async () => {
      mockBlockModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Block fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated block', async () => {
      const updatedBlock = { _id: '1', title: 'Updated Block' };
      mockBlockModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('1', { title: 'Updated Block' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Block updated successfully',
        data: updatedBlock,
      });
      expect(mockBlockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Block' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if block is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        blockId: '1',
      });
    });

    it('should delete a block by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockBlockModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockBlockModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Block deleted successfully',
        data: [],
      });
    });
  });
});
