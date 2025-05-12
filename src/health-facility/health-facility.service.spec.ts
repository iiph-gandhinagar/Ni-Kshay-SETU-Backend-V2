import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { HealthFacilityService } from './health-facility.service';

const mockHealthFacilityModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Health Facility' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Health Facility' }),
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

describe('HealthFacilityService', () => {
  let service: HealthFacilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthFacilityService,
        {
          provide: getModelToken('HealthFacility'),
          useValue: mockHealthFacilityModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<HealthFacilityService>(HealthFacilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Health Facility', async () => {
      const createHealthFacilityDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        blockId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        healthFacilityCode: 'HealthFacility',
        DMC: false,
        TRUNAT: false,
        CBNAAT: false,
        XRAY: false,
        ICTC: false,
        LPALab: false,
        CONFIRMATIONCENTER: false,
        TobaccoCessationClinic: false,
        ANCClinic: false,
        NutritionalRehabilitationCentre: false,
        DeAddictionCentres: false,
        ARTCentre: false,
        DistrictDRTBCentre: false,
        NODALDRTBCENTER: false,
        IRL: false,
        PediatricCareFacility: false,
        longitude: '1.0.0.01',
        latitude: '4.0.05.2',
      };
      const mockHealthFacility = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createHealthFacilityDto,
      };
      mockHealthFacilityModel.create.mockResolvedValue(mockHealthFacility);

      const result = await service.create(createHealthFacilityDto);
      // console.log('result--->', result);
      expect(mockHealthFacilityModel.create).toHaveBeenCalledWith(
        createHealthFacilityDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Health Facility created successfully',
        data: mockHealthFacility,
      });
    });
  });

  describe('findAll', () => {
    it('should return Health Facility with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockHealthFacilities = [{ name: 'Block 1' }, { name: 'Block 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHealthFacilities),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockHealthFacilityModel.find.mockReturnValue(mockQuery);
      mockHealthFacilityModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockHealthFacilities,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockHealthFacilityModel.find).toHaveBeenCalled();
      expect(mockHealthFacilityModel.countDocuments).toHaveBeenCalledWith([]);
    });
  });

  describe('findOne', () => {
    it('should return a Health Facility by ID', async () => {
      const mockBlock = { _id: '1', name: 'Test Health Facility' };
      mockHealthFacilityModel.findById.mockReturnValue(mockBlock);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Health Facility fetch successfully',
        data: mockBlock,
      });
      expect(mockHealthFacilityModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Health Facility not found', async () => {
      mockHealthFacilityModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Health Facility fetch successfully',
        data: null,
      });
      // expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated Health Facility', async () => {
      const updatedBlock = {
        _id: '1',
        healthFacilityCode: 'Updated Health Facility',
      };
      mockHealthFacilityModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('1', {
        healthFacilityCode: 'Updated Health Facility',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Health Facility updated successfully',
        data: updatedBlock,
      });
      expect(mockHealthFacilityModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { healthFacilityCode: 'Updated Health Facility' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if Health Facility is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        healthFacilityId: '1',
      });
    });

    it('should delete a Health Facility by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockHealthFacilityModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockHealthFacilityModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Health Facility deleted successfully',
        data: [],
      });
    });
  });
});
