import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CadreService } from './cadre.service';
const mockCadreModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Cadre' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Cadre' }),
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
describe('CadreService', () => {
  let service: CadreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CadreService,
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<CadreService>(CadreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Cadre', async () => {
      const createCadreDto = {
        id: 1,
        cadreGroup: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        cadreType: 'State-level',
        title: 'Cadre',
      };
      const mockCadre = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createCadreDto,
      };
      mockCadreModel.create.mockResolvedValue(mockCadre);

      const result = await service.create(createCadreDto);
      expect(mockCadreModel.create).toHaveBeenCalledWith(createCadreDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre Created successfully',
        data: mockCadre,
      });
    });
  });

  describe('findAll', () => {
    it('should return Cadres with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockCadres = [{ name: 'cadre 1' }, { name: 'cadre 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCadres),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockCadreModel.find.mockReturnValue(mockQuery);
      mockCadreModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockCadres,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockCadreModel.find).toHaveBeenCalled();
      expect(mockCadreModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Cadre by ID', async () => {
      const mockCadre = { _id: '1', name: 'Test Cadre' };
      mockCadreModel.findById.mockReturnValue(mockCadre);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre fetch successfully',
        data: mockCadre,
      });
      expect(mockCadreModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Cadre not found', async () => {
      mockCadreModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Cadre', async () => {
      const updatedCadre = { _id: '1', title: 'Updated Cadre' };
      mockCadreModel.findByIdAndUpdate.mockResolvedValue(updatedCadre);

      const result = await service.update('1', { title: 'Updated Cadre' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre updated successfully',
        data: updatedCadre,
      });
      expect(mockCadreModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Cadre' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if Cadre is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        cadreId: '1',
      });
    });

    it('should delete a cadre by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockCadreModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockCadreModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Cadre deleted successfully',
        data: [],
      });
    });
  });
});
