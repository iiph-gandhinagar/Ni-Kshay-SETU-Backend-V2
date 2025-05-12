import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticAppConfigService } from './static-app-config.service';
const mockStaticAppConfigModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static App Config' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static App Config' }),
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
describe('StaticAppConfigService', () => {
  let service: StaticAppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticAppConfigService,
        {
          provide: getModelToken('StaticAppConfig'),
          useValue: mockStaticAppConfigModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticAppConfigService>(StaticAppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a Static App Config', async () => {
      const createStaticAppConfigDto = {
        key: 'app_config',
        type: 'static',
        value: { en: 'App Config' },
      };
      const mockStaticAppConfig = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticAppConfigDto,
      };
      mockStaticAppConfigModel.create.mockResolvedValue(mockStaticAppConfig);

      const result = await service.create(createStaticAppConfigDto);
      expect(mockStaticAppConfigModel.create).toHaveBeenCalledWith(
        createStaticAppConfigDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config Created successfully',
        data: mockStaticAppConfig,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static App Config with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticAppConfigs = [
        { name: 'StaticApp Config 1' },
        { name: 'StaticApp Config 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticAppConfigs),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticAppConfigModel.find.mockReturnValue(mockQuery);
      mockStaticAppConfigModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticAppConfigs,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticAppConfigModel.find).toHaveBeenCalled();
      expect(mockStaticAppConfigModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findAllWithoutPagination', () => {
    it('should return all static web app configs with the provided language', async () => {
      const lang = 'en';
      const mockConfigs = [
        { key: 'welcomeMessage', value: { en: 'Welcome', fr: 'Bienvenue' } },
        { key: 'goodbyeMessage', value: { en: 'Goodbye', fr: 'Au revoir' } },
      ];

      const expectedResponse = [
        { welcomeMessage: 'Welcome' },
        { goodbyeMessage: 'Goodbye' },
      ];

      mockStaticAppConfigModel.find.mockResolvedValue(mockConfigs);

      const result = await service.findAllWithoutPagination(lang);

      expect(mockStaticAppConfigModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config fetch successfully',
        data: expectedResponse,
      });
    });

    it('should default to English if no language is provided', async () => {
      const mockConfigs = [
        { key: 'welcomeMessage', value: { en: 'Welcome', fr: 'Bienvenue' } },
      ];

      const expectedResponse = [{ welcomeMessage: 'Welcome' }];

      mockStaticAppConfigModel.find.mockResolvedValue(mockConfigs);

      const result = await service.findAllWithoutPagination('');

      expect(mockStaticAppConfigModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config fetch successfully',
        data: expectedResponse,
      });
    });
  });

  describe('findOne', () => {
    it('should return a Static App Config by ID', async () => {
      const mockStaticAppConfig = { _id: '1', name: 'Test Static App Config' };
      mockStaticAppConfigModel.findById.mockReturnValue(mockStaticAppConfig);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config fetch successfully',
        data: mockStaticAppConfig,
      });
      expect(mockStaticAppConfigModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static App ConfigI not found', async () => {
      mockStaticAppConfigModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static App Config', async () => {
      const updatedStaticAppConfig = {
        _id: '1',
        key: 'Updated Static App Config',
      };
      mockStaticAppConfigModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticAppConfig,
      );

      const result = await service.update('1', {
        key: 'Updated Static App Config',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config updated successfully',
        data: updatedStaticAppConfig,
      });
      expect(mockStaticAppConfigModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { key: 'Updated Static App Config' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static App Config by ID ', async () => {
      mockStaticAppConfigModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticAppConfigModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static app config deleted successfully',
        data: [],
      });
    });
  });
});
