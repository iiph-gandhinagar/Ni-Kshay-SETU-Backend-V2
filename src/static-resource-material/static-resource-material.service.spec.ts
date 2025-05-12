import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticResourceMaterialService } from './static-resource-material.service';

const mockStaticResourceMaterialModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static Resource material' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static Resource material' }),
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
describe('StaticResourceMaterialService', () => {
  let service: StaticResourceMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticResourceMaterialService,
        {
          provide: getModelToken('StaticResourceMaterial'),
          useValue: mockStaticResourceMaterialModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticResourceMaterialService>(
      StaticResourceMaterialService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Static resource material', async () => {
      const createStaticDto = {
        id: 1,
        material: ['material 1', 'material 2'],
        typeOfMaterials: 'pdf',
        orderIndex: 1,
        active: false,
        title: { en: 'Static Resource material' },
      };
      const mockStaticResource = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticDto,
      };
      mockStaticResourceMaterialModel.create.mockResolvedValue(
        mockStaticResource,
      );

      const result = await service.create(createStaticDto);
      console.log('result--->', result);
      expect(mockStaticResourceMaterialModel.create).toHaveBeenCalledWith(
        createStaticDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static resource material Created successfully',
        data: mockStaticResource,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static resource material with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticResources = [
        { name: 'Static resource material 1' },
        { name: 'Static resource material 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticResources),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticResourceMaterialModel.find.mockReturnValue(mockQuery);
      mockStaticResourceMaterialModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticResources,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticResourceMaterialModel.find).toHaveBeenCalled();
      expect(
        mockStaticResourceMaterialModel.countDocuments,
      ).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Static resource material by ID', async () => {
      const mockStaticResource = {
        _id: '1',
        title: 'Test Static resource material',
      };
      mockStaticResourceMaterialModel.findById.mockReturnValue(
        mockStaticResource,
      );

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static resource material fetch successfully',
        data: mockStaticResource,
      });
      expect(mockStaticResourceMaterialModel.findById).toHaveBeenCalledWith(
        '1',
      );
    });

    it('should return null if Static resource material not found', async () => {
      mockStaticResourceMaterialModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static resource material fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static resource material', async () => {
      const updatedStaticResource = {
        _id: '1',
        active: false,
      };
      mockStaticResourceMaterialModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticResource,
      );

      const result = await service.update('1', { active: false });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static resource material updated successfully',
        data: updatedStaticResource,
      });
      expect(
        mockStaticResourceMaterialModel.findByIdAndUpdate,
      ).toHaveBeenCalledWith('1', { active: false }, { new: true });
    });
  });

  describe('remove', () => {
    it('should delete a Static resource material by ID', async () => {
      mockStaticResourceMaterialModel.findByIdAndDelete.mockResolvedValueOnce(
        {},
      );

      const result = await service.remove('1');

      expect(
        mockStaticResourceMaterialModel.findByIdAndDelete,
      ).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static resource material deleted successfully',
        data: [],
      });
    });
  });
});
