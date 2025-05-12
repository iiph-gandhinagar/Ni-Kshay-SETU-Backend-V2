import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrimaryCadreService } from './primary-cadre.service';
const mockPrimaryCadreModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Primary Cadre' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Primary Cadre' }),
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
const mockCadreModel = {
  find: jest.fn(),
};
describe('PrimaryCadreService', () => {
  let service: PrimaryCadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrimaryCadreService,
        {
          provide: getModelToken('PrimaryCadre'),
          useValue: mockPrimaryCadreModel,
        },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<PrimaryCadreService>(PrimaryCadreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Primary Cadre', async () => {
      const createPrimaryCadreDto = {
        id: 1,
        audienceId: '1',
        title: 'Primary-cadre',
      };
      const mockPrimaryCadre = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createPrimaryCadreDto,
      };
      mockPrimaryCadreModel.create.mockResolvedValue(mockPrimaryCadre);

      const result = await service.create(createPrimaryCadreDto);
      console.log('result--->', result);
      expect(mockPrimaryCadreModel.create).toHaveBeenCalledWith(
        createPrimaryCadreDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Primary Cadre Created successfully',
        data: mockPrimaryCadre,
      });
    });
  });

  describe('findAll', () => {
    it('should return Primary Cadre with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockPrimaryCadre = [
        { name: 'Primary Cadre 1' },
        { name: 'Primary Cadre 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPrimaryCadre),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockPrimaryCadreModel.find.mockReturnValue(mockQuery);
      mockPrimaryCadreModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockPrimaryCadre,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockPrimaryCadreModel.find).toHaveBeenCalled();
      expect(mockPrimaryCadreModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Primary Cadre by ID', async () => {
      const mockPrimaryCadre = { _id: '1', name: 'Test Primary Cadre' };
      mockPrimaryCadreModel.findById.mockReturnValue(mockPrimaryCadre);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Primary Cadre fetch successfully',
        data: mockPrimaryCadre,
      });
      expect(mockPrimaryCadreModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Primary Cadre not found', async () => {
      mockPrimaryCadreModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Primary Cadre fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Primary Cadre', async () => {
      const updatedBlock = { _id: '1', title: 'Updated Primary Cadre' };
      mockPrimaryCadreModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('1', {
        title: 'Updated Primary Cadre',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Primary Cadre updated successfully',
        data: updatedBlock,
      });
      expect(mockPrimaryCadreModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Primary Cadre' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if Primary Cadre is linked to a cadre', async () => {
      const mockLinkedCadre = [{ _id: '123', cadreGroup: '1' }]; // Simulate a linked cadre
      mockCadreModel.find.mockResolvedValueOnce(mockLinkedCadre);

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockCadreModel.find).toHaveBeenCalledWith({ cadreGroup: '1' });
    });

    it('should delete a Primary Cadre by ID if not linked to a subscriber', async () => {
      mockCadreModel.find.mockResolvedValueOnce(null);
      mockPrimaryCadreModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockPrimaryCadreModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Primary Cadre deleted successfully',
        data: [],
      });
    });
  });
});
