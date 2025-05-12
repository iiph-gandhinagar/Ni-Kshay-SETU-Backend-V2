import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FlashNewsService } from './flash-news.service';

const mockFlashNewsModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Flash news' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Flash news' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

const mockFilterService = {
  filter: jest.fn(),
};
describe('FlashNewsService', () => {
  let service: FlashNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashNewsService,
        { provide: getModelToken('FlashNews'), useValue: mockFlashNewsModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<FlashNewsService>(FlashNewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Flash News', async () => {
      const createFlashNewsDto = {
        id: 1,
        description: 'Flash news',
        image: 'Flash news Image',
        author: 'news',
        source: 'EIN News',
        href: 'https://news.google.com',
        orderIndex: 1000,
        publishDate: new Date(),
        title: 'Tuberculosis',
        active: true,
      };
      const mockFlashNews = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createFlashNewsDto,
      };
      mockFlashNewsModel.create.mockResolvedValue(mockFlashNews);

      const result = await service.create(createFlashNewsDto);
      expect(mockFlashNewsModel.create).toHaveBeenCalledWith(
        createFlashNewsDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash News created successfully',
        data: mockFlashNews,
      });
    });
  });

  describe('findAll', () => {
    it('should return Flash News with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockFlashNews = [
        { name: 'Flash News 1' },
        { name: 'Flash News 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFlashNews),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockFlashNewsModel.find.mockReturnValue(mockQuery);
      mockFlashNewsModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockFlashNews,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockFlashNewsModel.find).toHaveBeenCalled();
      expect(mockFlashNewsModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Flash news by ID', async () => {
      const mockFlashNews = { _id: '1', name: 'Test Flash News' };
      mockFlashNewsModel.findById.mockReturnValue(mockFlashNews);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash News fetch successfully',
        data: mockFlashNews,
      });
      expect(mockFlashNewsModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Flash news not found', async () => {
      mockFlashNewsModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash News fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Flash News', async () => {
      const updatedFlashNews = { _id: '1', title: 'Updated Flash News' };
      mockFlashNewsModel.findByIdAndUpdate.mockResolvedValue(updatedFlashNews);

      const result = await service.update('1', { title: 'Updated Flash News' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash News updated successfully',
        data: updatedFlashNews,
      });
      expect(mockFlashNewsModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Flash News' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Flash news by ID ', async () => {
      mockFlashNewsModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockFlashNewsModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Flash News deleted successfully',
        data: [],
      });
    });
  });
});
