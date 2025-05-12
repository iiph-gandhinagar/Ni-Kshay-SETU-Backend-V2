import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StateService } from './state.service';

const mockStateModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test State' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated State' }),
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

describe('StateService', () => {
  let service: StateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a state', async () => {
      const createStateDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'state',
      };
      const mockState = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStateDto,
      };
      mockStateModel.create.mockResolvedValue(mockState);

      const result = await service.create(createStateDto);
      // console.log('result--->', result);
      expect(mockStateModel.create).toHaveBeenCalledWith(createStateDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'States Created successfully',
        data: mockState,
      });
    });
  });

  describe('findAll', () => {
    it('should return states with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockState = [{ name: 'State 1' }, { name: 'State 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockState),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStateModel.find.mockReturnValue(mockQuery);
      mockStateModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockState,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStateModel.find).toHaveBeenCalled();
      expect(mockStateModel.countDocuments).toHaveBeenCalledWith([]);
    });
  });

  describe('update', () => {
    it('should update and return the updated State', async () => {
      const updatedState = { _id: '1', title: 'Updated State' };
      mockStateModel.findByIdAndUpdate.mockResolvedValue(updatedState);

      const result = await service.update('1', { title: 'Updated state' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'States updated successfully',
        data: updatedState,
      });
      expect(mockStateModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated state' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if State is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        stateId: '1',
      });
    });

    it('should delete a Sate by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockStateModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStateModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'States deleted successfully',
        data: [],
      });
    });
  });
});
