import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CountryService } from './country.service';

const mockCountryModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Block' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
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
describe('CountryService', () => {
  let service: CountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Country', async () => {
      const createCountryDto = {
        id: 1,
        title: 'Country',
      };
      const mockCountry = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createCountryDto,
      };
      mockCountryModel.create.mockResolvedValue(mockCountry);

      const result = await service.create(createCountryDto);
      expect(mockCountryModel.create).toHaveBeenCalledWith(createCountryDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Country created successfully',
        data: mockCountry,
      });
    });
  });

  describe('findAll', () => {
    it('should return Country with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockCountries = [{ name: 'Country 1' }, { name: 'Country 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCountries),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockCountryModel.find.mockReturnValue(mockQuery);
      mockCountryModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockCountries,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockCountryModel.find).toHaveBeenCalled();
      expect(mockCountryModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Country by ID', async () => {
      const mockCountry = { _id: '1', name: 'Test Country' };
      mockCountryModel.findById.mockReturnValue(mockCountry);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Country fetch successfully',
        data: mockCountry,
      });
      expect(mockCountryModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Country not found', async () => {
      mockCountryModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Country fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Country', async () => {
      const updatedCountry = { _id: '1', title: 'Updated Country' };
      mockCountryModel.findByIdAndUpdate.mockResolvedValue(updatedCountry);

      const result = await service.update('1', { title: 'Updated Country' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Country updated successfully',
        data: updatedCountry,
      });
      expect(mockCountryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Country' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if Country is linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockSubscriberModel.findOne).toHaveBeenCalledWith({
        countryId: '1',
      });
    });

    it('should delete a Country by ID if not linked to a subscriber', async () => {
      mockSubscriberModel.findOne.mockResolvedValueOnce(null);
      mockCountryModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockCountryModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Country deleted successfully',
        data: [],
      });
    });
  });
});
