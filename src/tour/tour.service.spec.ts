import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { TourService } from './tour.service';
const mockTourModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Tour' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Tour' }),
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
describe('TourService', () => {
  let service: TourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        { provide: getModelToken('Tour'), useValue: mockTourModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<TourService>(TourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Tour', async () => {
      const createTourDto = {
        id: 1,
        tourSlides: [
          {
            title: { en: 'tour slide1' },
            shortDescription: { en: 'short-description' },
            description: { en: 'description' },
            icon: 'icon',
            colorGradient: ['colors'],
            textColor: ['textColors'],
            createdAt: new Date(),
            orderIndex: 1,
          },
        ],
        active: false,
        default: true,
        title: { en: 'tour' },
      };
      const mockTour = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createTourDto,
      };
      mockTourModel.create.mockResolvedValue(mockTour);

      const result = await service.create(createTourDto);
      expect(mockTourModel.create).toHaveBeenCalledWith(createTourDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour Created successfully',
        data: mockTour,
      });
    });
  });

  describe('findAll', () => {
    it('should return Tours with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockTours = [{ name: 'Tour 1' }, { name: 'Tour 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTours),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockTourModel.find.mockReturnValue(mockQuery);
      mockTourModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockTours,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockTourModel.find).toHaveBeenCalled();
      expect(mockTourModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Tour by ID', async () => {
      const mockTour = { _id: '1', name: 'Test Tour' };
      mockTourModel.findById.mockReturnValue(mockTour);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour fetch successfully',
        data: mockTour,
      });
      expect(mockTourModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Tour not found', async () => {
      mockTourModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour fetch successfully',
        data: null,
      });
    });
  });

  describe('tourWithTourSlides', () => {
    it('should return default tour slides if no active tour exists', async () => {
      const mockDefaultTour = [
        { tourSlides: ['defaultSlide1', 'defaultSlide2'], default: true },
      ];

      mockTourModel.find
        .mockResolvedValueOnce([]) // No active tours
        .mockResolvedValueOnce(mockDefaultTour); // Return default tour

      const result = await service.tourWithTourSlides(); // Capture result

      expect(mockTourModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockTourModel.find).toHaveBeenCalledWith({ default: true });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour fetch successfully',
        data: mockDefaultTour[0].tourSlides,
      });
    });

    it('should return default tour slides if no active tour exists', async () => {
      const mockDefaultTour = [
        { tourSlides: ['defaultSlide1', 'defaultSlide2'], default: true },
      ];

      mockTourModel.find
        .mockResolvedValueOnce([]) // No active tours
        .mockResolvedValueOnce(mockDefaultTour); // Default tours

      const result = await service.tourWithTourSlides(); // Capture the result

      expect(mockTourModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockTourModel.find).toHaveBeenCalledWith({ default: true });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour fetch successfully',
        data: mockDefaultTour[0].tourSlides,
      });
    });

    it('should return null if Tour not found', async () => {
      mockTourModel.find.mockResolvedValueOnce([]); // No active tours
      mockTourModel.find.mockResolvedValueOnce([]); // No default tours

      const result = await service.tourWithTourSlides(); // Capture the result

      expect(mockTourModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockTourModel.find).toHaveBeenCalledWith({ default: true });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour fetch successfully',
        data: [],
      });
      // expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated Tour', async () => {
      const updatedTour = { _id: '1', active: false };
      mockTourModel.findByIdAndUpdate.mockResolvedValue(updatedTour);

      const result = await service.update('1', { active: false });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour updated successfully',
        data: updatedTour,
      });
      expect(mockTourModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Tour by ID if not linked to a subscriber', async () => {
      mockTourModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockTourModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Tour deleted successfully',
        data: [],
      });
    });
  });
});
