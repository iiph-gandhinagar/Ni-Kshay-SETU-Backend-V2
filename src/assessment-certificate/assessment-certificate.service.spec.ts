import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AssessmentCertificateService } from './assessment-certificate.service';
const mockAssessmentCertificateModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Assessment Certificate' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Assessment Certificate' }),
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
const mockAssessmentModel = {
  findOne: jest.fn(),
};
describe('AssessmentCertificateService', () => {
  let service: AssessmentCertificateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentCertificateService,
        {
          provide: getModelToken('AssessmentCertificate'),
          useValue: mockAssessmentCertificateModel,
        },
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AssessmentCertificateService>(
      AssessmentCertificateService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Assessment Certificate', async () => {
      const createAssessmentCertificateDto = {
        top: 27,
        left: 25,
        image: 'image',
        createdBy: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'assessment certificate',
      };
      const mockAssessmentCertificate = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAssessmentCertificateDto,
      };
      mockAssessmentCertificateModel.create.mockResolvedValue(
        mockAssessmentCertificate,
      );

      const result = await service.create(
        createAssessmentCertificateDto,
        '6666c830eb18953046b1b56b',
      );
      expect(mockAssessmentCertificateModel.create).toHaveBeenCalledWith(
        createAssessmentCertificateDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate Created successfully',
        data: mockAssessmentCertificate,
      });
    });
  });

  describe('findAll', () => {
    it('should return Assessment Certificate with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAssessmentCertificates = [
        { name: 'AssessmentCertificate 1' },
        { name: 'AssessmentCertificate 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAssessmentCertificates),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAssessmentCertificateModel.find.mockReturnValue(mockQuery);
      mockAssessmentCertificateModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAssessmentCertificates,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAssessmentCertificateModel.find).toHaveBeenCalled();
      expect(
        mockAssessmentCertificateModel.countDocuments,
      ).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a AssessmentCertificate by ID', async () => {
      const mockAssessmentCertificate = {
        _id: '1',
        name: 'Test AssessmentCertificate',
      };
      mockAssessmentCertificateModel.findById.mockReturnValue(
        mockAssessmentCertificate,
      );

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate  fetch successfully',
        data: mockAssessmentCertificate,
      });
      expect(mockAssessmentCertificateModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if AssessmentCertificate not found', async () => {
      mockAssessmentCertificateModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate  fetch successfully',
        data: null,
      });
    });
  });

  describe('findAllCertificate', () => {
    it('should return all AssessmentCertificate', async () => {
      const mockAssessmentCertificate = [
        {
          _id: '1',
          name: 'Test AssessmentCertificate',
        },
      ];
      mockAssessmentCertificateModel.find.mockReturnValue(
        mockAssessmentCertificate,
      );

      const result = await service.findAllCertificate();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate  fetch successfully',
        data: mockAssessmentCertificate,
      });
      expect(mockAssessmentCertificateModel.find).toHaveBeenCalledWith();
    });
  });

  describe('update', () => {
    it('should update and return the updated AssessmentCertificate', async () => {
      const updatedAssessmentCertificate = {
        _id: '1',
        title: 'Updated AssessmentCertificate',
      };
      mockAssessmentCertificateModel.findByIdAndUpdate.mockResolvedValue(
        updatedAssessmentCertificate,
      );

      const result = await service.update('1', {
        title: 'Updated AssessmentCertificate',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate updated successfully',
        data: updatedAssessmentCertificate,
      });
      expect(
        mockAssessmentCertificateModel.findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '1',
        { title: 'Updated AssessmentCertificate' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if AssessmentCertificate is linked to a subscriber', async () => {
      mockAssessmentModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockAssessmentModel.findOne).toHaveBeenCalledWith({
        certificateType: '1',
      });
    });

    it('should delete a AssessmentCertificate by ID if not linked to a subscriber', async () => {
      mockAssessmentModel.findOne.mockResolvedValueOnce(null);
      mockAssessmentCertificateModel.findByIdAndDelete.mockResolvedValueOnce(
        {},
      );

      const result = await service.remove('1');

      expect(
        mockAssessmentCertificateModel.findByIdAndDelete,
      ).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Certificate deleted successfully',
        data: [],
      });
    });
  });
});
