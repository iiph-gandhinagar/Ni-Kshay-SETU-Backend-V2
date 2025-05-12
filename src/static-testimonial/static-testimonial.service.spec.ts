import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticTestimonialService } from './static-testimonial.service';
const mockStaticTestimonialModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static testimonial' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static testimonial' }),
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
describe('StaticTestimonialService', () => {
  let service: StaticTestimonialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticTestimonialService,
        {
          provide: getModelToken('StaticTestimonial'),
          useValue: mockStaticTestimonialModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticTestimonialService>(StaticTestimonialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Static testimonial', async () => {
      const createStaticTestimonialDto = {
        id: 1,
        name: { en: 'static Testimonial' },
        description: { en: 'Static' },
        orderIndex: 1,
        active: false,
      };
      const mockStaticTestimonial = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticTestimonialDto,
      };
      mockStaticTestimonialModel.create.mockResolvedValue(
        mockStaticTestimonial,
      );

      const result = await service.create(createStaticTestimonialDto);
      console.log('result--->', result);
      expect(mockStaticTestimonialModel.create).toHaveBeenCalledWith(
        createStaticTestimonialDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static testimonial Created successfully',
        data: mockStaticTestimonial,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static testimonial with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticTestimonials = [
        { name: 'Static testimonial 1' },
        { name: 'Static testimonial 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticTestimonials),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticTestimonialModel.find.mockReturnValue(mockQuery);
      mockStaticTestimonialModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticTestimonials,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticTestimonialModel.find).toHaveBeenCalled();
      expect(mockStaticTestimonialModel.countDocuments).toHaveBeenCalledWith(
        {},
      );
    });
  });

  describe('findOne', () => {
    it('should return a Static testimonial by ID', async () => {
      const mockStaticTestimonial = {
        _id: '1',
        name: 'Test Static testimonial',
      };
      mockStaticTestimonialModel.findById.mockReturnValue(
        mockStaticTestimonial,
      );

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static testimonial fetch successfully',
        data: mockStaticTestimonial,
      });
      expect(mockStaticTestimonialModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static testimonial not found', async () => {
      mockStaticTestimonialModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static testimonial fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static testimonial', async () => {
      const updatedStaticTestimonial = { _id: '1', active: false };
      mockStaticTestimonialModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticTestimonial,
      );

      const result = await service.update('1', { active: false });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static testimonial updated successfully',
        data: updatedStaticTestimonial,
      });
      expect(mockStaticTestimonialModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static testimonial by ID ', async () => {
      mockStaticTestimonialModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticTestimonialModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static testimonial deleted successfully',
        data: [],
      });
    });
  });
});
