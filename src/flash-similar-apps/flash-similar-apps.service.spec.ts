import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FlashSimilarAppsService } from './flash-similar-apps.service';
const mockFlashSimilarModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Flash Similar App' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Flash Similar App' }),
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

describe('FlashSimilarAppsService', () => {
  let service: FlashSimilarAppsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashSimilarAppsService,
        {
          provide: getModelToken('FlashSimilarApp'),
          useValue: mockFlashSimilarModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<FlashSimilarAppsService>(FlashSimilarAppsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Similar Apps', async () => {
      const createFlashSimilarAppDto = {
        id: 1,
        image: 'http://google.com',
        subTitle: 'Flash Similar Apps',
        href: 'flash Similar Apps',
        hrefWeb: 'flash Similar Apps',
        hrefIos: 'flash Similar Apps',
        orderIndex: 1,
        title: 'Flash Similar Apps',
        active: true,
      };
      const mockFlashSimilarApp = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createFlashSimilarAppDto,
      };
      mockFlashSimilarModel.create.mockResolvedValue(mockFlashSimilarApp);

      const result = await service.create(createFlashSimilarAppDto);
      expect(mockFlashSimilarModel.create).toHaveBeenCalledWith(
        createFlashSimilarAppDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App created successfully',
        data: mockFlashSimilarApp,
      });
    });
  });

  describe('findAll', () => {
    it('should return Flash Similar Apps with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockFlashSimilarApps = [
        { name: 'Flash Similar App 1' },
        { name: 'Flash Similar App 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFlashSimilarApps),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockFlashSimilarModel.find.mockReturnValue(mockQuery);
      mockFlashSimilarModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockFlashSimilarApps,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockFlashSimilarModel.find).toHaveBeenCalled();
      expect(mockFlashSimilarModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Flash Similar App by ID', async () => {
      const mockFlashSimilarApp = { _id: '1', name: 'Test Flash Similar App' };
      mockFlashSimilarModel.findById.mockReturnValue(mockFlashSimilarApp);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App fetch successfully',
        data: mockFlashSimilarApp,
      });
      expect(mockFlashSimilarModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Flash Similar App not found', async () => {
      mockFlashSimilarModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Flash Similar App', async () => {
      const updatedFlashSimilarApp = {
        _id: '1',
        title: 'Updated Flash Similar App',
      };
      mockFlashSimilarModel.findByIdAndUpdate.mockResolvedValue(
        updatedFlashSimilarApp,
      );

      const result = await service.update('1', {
        title: 'Updated Flash Similar App',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App updated successfully',
        data: updatedFlashSimilarApp,
      });
      expect(mockFlashSimilarModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Flash Similar App' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Flash Similar App by ID', async () => {
      mockFlashSimilarModel.findOne.mockResolvedValueOnce(null);
      mockFlashSimilarModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockFlashSimilarModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App deleted successfully',
        data: [],
      });
    });
  });

  describe('findActiveSimilarApps', () => {
    it('should return Flash Similar Apps', async () => {
      const mockFlashSimilarApp = [
        { _id: '1', name: 'Test Flash Similar App', active: true },
      ];
      mockFlashSimilarModel.find.mockReturnValue(mockFlashSimilarApp);

      const result = await service.findActiveSimilarApps();

      expect(mockFlashSimilarModel.find).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash Similar App fetch successfully',
        data: mockFlashSimilarApp,
      });
    });
  });
});
