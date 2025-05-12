import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { DistrictService } from './district.service';
const mockDistrictModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test District' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated District' }),
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
describe('DistrictService', () => {
  let service: DistrictService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistrictService,
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<DistrictService>(DistrictService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a District', async () => {
      const createDistrictDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'District',
      };
      const mockDistrict = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createDistrictDto,
      };
      mockDistrictModel.create.mockResolvedValue(mockDistrict);

      const result = await service.create(createDistrictDto);
      expect(mockDistrictModel.create).toHaveBeenCalledWith(createDistrictDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'District created successfully',
        data: mockDistrict,
      });
    });
  });

  describe('findAll', () => {
    it('should return District with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockDistricts = [{ name: 'DistrictI 1' }, { name: 'DistrictI 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDistricts),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockDistrictModel.find.mockReturnValue(mockQuery);
      mockDistrictModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockDistricts,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockDistrictModel.find).toHaveBeenCalled();
      expect(mockDistrictModel.countDocuments).toHaveBeenCalledWith([]);
    });
  });

  describe('findOne', () => {
    it('should return a District by ID', async () => {
      const mockDistrict = { _id: '1', name: 'Test District' };
      mockDistrictModel.findById.mockReturnValue(mockDistrict);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'District fetch successfully',
        data: mockDistrict,
      });
      expect(mockDistrictModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if District not found', async () => {
      mockDistrictModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'District fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated District', async () => {
      const updatedDistrict = { _id: '1', title: 'Updated District' };
      mockDistrictModel.findByIdAndUpdate.mockResolvedValue(updatedDistrict);

      const result = await service.update('1', { title: 'Updated District' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'District updated successfully',
        data: updatedDistrict,
      });
      expect(mockDistrictModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated District' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if District is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        districtId: '1',
      });
    });

    it('should delete a district by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockDistrictModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockDistrictModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'District deleted successfully',
        data: [],
      });
    });
  });
});
