import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticFaqService } from './static-faq.service';

const mockStaticFaqModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Static Faq' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static Faq' }),
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

describe('StaticFaqService', () => {
  let service: StaticFaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticFaqService,
        { provide: getModelToken('StaticFaq'), useValue: mockStaticFaqModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticFaqService>(StaticFaqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Static Faq', async () => {
      const createStaticFaqDto = {
        question: { en: 'static Faq', hi: 'static', gu: 'faq' },
        description: { en: 'static faq', hi: 'static', gu: 'faq' },
        orderIndex: 1,
        active: true,
      };
      const mockStaticFaq = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticFaqDto,
      };
      mockStaticFaqModel.create.mockResolvedValue(mockStaticFaq);

      const result = await service.create(createStaticFaqDto);
      console.log('result--->', result);
      expect(mockStaticFaqModel.create).toHaveBeenCalledWith(
        createStaticFaqDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static FAQ Created successfully',
        data: mockStaticFaq,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static Faq with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaciFaqs = [
        { name: 'Static Faq 1' },
        { name: 'Static Faq 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaciFaqs),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticFaqModel.find.mockReturnValue(mockQuery);
      mockStaticFaqModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaciFaqs,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticFaqModel.find).toHaveBeenCalled();
      expect(mockStaticFaqModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findAllWithoutPagination', () => {
    it('should return Static Faq with pagination', async () => {
      const lang = 'en';

      const mockStaciFaqs = [
        { question: { en: 'Static Faq 1' } },
        { question: { en: 'Static Faq 2' } },
      ];

      mockStaticFaqModel.find.mockReturnThis();
      mockStaticFaqModel.sort.mockReturnThis();
      mockStaticFaqModel.exec = jest.fn().mockResolvedValue(mockStaciFaqs);

      const result = await service.findAllWithoutPagination(lang);
      expect(mockStaticFaqModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockStaticFaqModel.sort).toHaveBeenCalledWith({ orderIndex: 1 });
      expect(result).toEqual({
        message: 'Static FAQ fetch successfully',
        data: mockStaciFaqs,
        statusCode: 200,
      });
    });
  });

  describe('findOne', () => {
    it('should return a Static FAQ by ID', async () => {
      const mockStaticFaq = { _id: '1', name: 'Test Static FAQ' };
      mockStaticFaqModel.findById.mockReturnValue(mockStaticFaq);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static FAQ fetch successfully',
        data: mockStaticFaq,
      });
      expect(mockStaticFaqModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static FAQ not found', async () => {
      mockStaticFaqModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static FAQ fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static FAQ', async () => {
      const updatedStaticFaq = { _id: '1', active: false };
      mockStaticFaqModel.findByIdAndUpdate.mockResolvedValue(updatedStaticFaq);

      const result = await service.update('1', {
        active: false,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static FAQ updated successfully',
        data: updatedStaticFaq,
      });
      expect(mockStaticFaqModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static FAQ by ID', async () => {
      mockStaticFaqModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticFaqModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static FAQ deleted successfully',
        data: [],
      });
    });
  });
});
