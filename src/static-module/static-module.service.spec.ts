import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticModuleService } from './static-module.service';
import { HttpException, HttpStatus } from '@nestjs/common';
const mockStaticModuleModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static module' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static module' }),
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
describe('StaticModuleService', () => {
  let service: StaticModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticModuleService,
        {
          provide: getModelToken('StaticModule'),
          useValue: mockStaticModuleModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticModuleService>(StaticModuleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Static module', async () => {
      const createStaticModuleDto = {
        description: { en: 'static module' },
        slug: 'static-module',
        image: ['http://google.com'],
        title: { en: 'static module' },
        orderIndex: 1,
        active: true,
      };
      const mockStaticModule = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticModuleDto,
      };
      mockStaticModuleModel.create.mockResolvedValue(mockStaticModule);

      const result = await service.create(createStaticModuleDto);
      console.log('result--->', result);
      expect(mockStaticModuleModel.create).toHaveBeenCalledWith(
        createStaticModuleDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module Created successfully',
        data: mockStaticModule,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static module with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticModules = [
        { title: { en: 'Static module 1' } },
        { title: { en: 'Static module 2' } },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticModules),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticModuleModel.find.mockReturnValue(mockQuery);
      mockStaticModuleModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticModules,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticModuleModel.find).toHaveBeenCalled();
      expect(mockStaticModuleModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Static module by ID', async () => {
      const mockStaticModule = { _id: '1', tile: { en: 'Test Static module' } };
      mockStaticModuleModel.findById.mockReturnValue(mockStaticModule);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module fetch successfully',
        data: mockStaticModule,
      });
      expect(mockStaticModuleModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static module not found', async () => {
      mockStaticModuleModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module fetch successfully',
        data: null,
      });
    });
  });

  describe('getStaticModuleBySlug', () => {
    it('should return a Static module by ID', async () => {
      const mockStaticModule = { _id: '1', tile: { en: 'Test Static module' } };
      mockStaticModuleModel.findOne.mockReturnValue(mockStaticModule);

      const result = await service.getStaticModuleBySlug('static-module', 'en');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module fetch successfully',
        data: mockStaticModule,
      });
      expect(mockStaticModuleModel.findOne).toHaveBeenCalledWith({
        slug: new RegExp('static-module', 'i'),
      });
    });

    it('should return null if Static module not found', async () => {
      mockStaticModuleModel.findOne.mockResolvedValueOnce(null);

      await expect(service.getStaticModuleBySlug('faq', 'en')).rejects.toThrow(
        new HttpException(
          {
            message: 'Module Not Found!',
            errors: 'bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockStaticModuleModel.findOne).toHaveBeenCalledWith({
        slug: new RegExp('faq', 'i'),
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static module', async () => {
      const updated = { _id: '1', slug: 'Updated-Static-module' };
      mockStaticModuleModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.update('1', {
        slug: 'Updated-Static-module',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module updated successfully',
        data: updated,
      });
      expect(mockStaticModuleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { slug: 'Updated-Static-module' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static module by ID', async () => {
      mockStaticModuleModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticModuleModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static module deleted successfully',
        data: [],
      });
    });
  });
});
