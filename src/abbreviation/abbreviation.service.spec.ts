import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AbbreviationService } from './abbreviation.service';

const mockAbbreviationModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Abbreviation' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Abbreviation' }),
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

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AbbreviationService', () => {
  let service: AbbreviationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbbreviationService,
        {
          provide: getModelToken('Abbreviation'),
          useValue: mockAbbreviationModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AbbreviationService>(AbbreviationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Abbreviation', async () => {
      const createAbbreviationDto = {
        patterns: ['abc'],
        title: 'Abbreviation',
      };
      const mockAbbreviation = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAbbreviationDto,
      };
      mockAbbreviationModel.create.mockResolvedValue(mockAbbreviation);

      const result = await service.create(createAbbreviationDto);
      expect(mockAbbreviationModel.create).toHaveBeenCalledWith(
        createAbbreviationDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation Created successfully',
        data: mockAbbreviation,
      });
    });
  });

  describe('findData', () => {
    it('should return all Abbreviations', async () => {
      const mockAbbreviations = [
        { _id: '1', name: 'Test Abbreviation 1' },
        { _id: '2', name: 'Test Abbreviation 2' },
      ];
      mockAbbreviationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAbbreviations),
      });

      const result = await service.findData();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation fetch successfully',
        data: mockAbbreviations,
      });
      expect(mockAbbreviationModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findAll', () => {
    it('should return Abbreviation with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAbbreviation = [
        { name: 'Abbreviation 1' },
        { name: 'Abbreviation 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAbbreviation),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAbbreviationModel.find.mockReturnValue(mockQuery);
      mockAbbreviationModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAbbreviation,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAbbreviationModel.find).toHaveBeenCalled();
      expect(mockAbbreviationModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Abbreviation by ID', async () => {
      const mockAbbreviation = { _id: '1', name: 'Test Abbreviation' };
      mockAbbreviationModel.findById.mockReturnValue(mockAbbreviation);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation fetch successfully',
        data: mockAbbreviation,
      });
      expect(mockAbbreviationModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Abbreviation not found', async () => {
      mockAbbreviationModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Abbreviation', async () => {
      const updatedAbbreviation = { _id: '1', title: 'Updated Abbreviation' };
      mockAbbreviationModel.findByIdAndUpdate.mockResolvedValue(
        updatedAbbreviation,
      );

      const result = await service.update('1', {
        title: 'Updated Abbreviation',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation updated successfully',
        data: updatedAbbreviation,
      });
      expect(mockAbbreviationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Abbreviation' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Abbreviation by ID if not linked to a subscriber', async () => {
      mockAbbreviationModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockAbbreviationModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Abbreviation deleted successfully',
        data: [],
      });
    });
  });
});
