import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrescriptionService } from './prescription.service';

const mockPrescriptionModel = {
  find: jest.fn().mockReturnThis(),
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
describe('PrescriptionService', () => {
  let service: PrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        {
          provide: getModelToken('Prescription'),
          useValue: mockPrescriptionModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return Prescription with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockPrescription = [
        { name: 'Prescription 1' },
        { name: 'Prescription 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPrescription),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockPrescriptionModel.find.mockReturnValue(mockQuery);
      mockPrescriptionModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockPrescription,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockPrescriptionModel.find).toHaveBeenCalled();
      expect(mockPrescriptionModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('prescriptionReport', () => {
    it('should return all prescriptions', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockPrescription = [
        {
          _id: '67de564d6c9961c6db7dfc48',
          diagnosis: 'H Mono/poly DR-TB',
          regimen: 'H Mono/poly DR-TB Regimen',
        },
        {
          _id: '67de564d6c9961c6db7dfc48',
          diagnosis: 'H Mono/poly DR-TB',
          regimen: 'H Mono/poly DR-TB Regimen',
        },
      ];

      mockPrescriptionModel.find.mockReturnThis();
      mockPrescriptionModel.sort.mockReturnThis();
      mockPrescriptionModel.exec = jest
        .fn()
        .mockResolvedValue(mockPrescription);

      const result = await service.prescriptionReport(paginationDto);
      expect(mockPrescriptionModel.find).toHaveBeenCalled();
      expect(mockPrescriptionModel.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
      expect(mockPrescriptionModel.exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Prescription Report!!',
        data: mockPrescription,
      });
    });
  });
});
