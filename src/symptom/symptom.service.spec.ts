import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { SymptomService } from './symptom.service';
const mockSymptomModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Symptom' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated symptom' }),
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
const mockLanguageService = {
  getSymptomTranslatedFields: jest.fn().mockReturnValue({}),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('SymptomService', () => {
  let service: SymptomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SymptomService,
        { provide: getModelToken('Symptom'), useValue: mockSymptomModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: LanguageTranslation, useValue: mockLanguageService },
        // { provide: EmailService, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<SymptomService>(SymptomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a symptom', async () => {
      const createSymptomDto = {
        category: '1',
        icon: 'icon',
        title: { en: 'symptom' },
      };
      const mockSymptom = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createSymptomDto,
      };
      mockSymptomModel.create.mockResolvedValue(mockSymptom);

      const result = await service.create(createSymptomDto);
      console.log('result--->', result);
      expect(mockSymptomModel.create).toHaveBeenCalledWith(createSymptomDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Symptom Created successfully',
        data: mockSymptom,
      });
    });
  });

  describe('findAll', () => {
    it('should return Symptom with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockSymptoms = [{ name: 'Symptom 1' }, { name: 'Symptom 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSymptoms),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockSymptomModel.find.mockReturnValue(mockQuery);
      mockSymptomModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockSymptoms,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockSymptomModel.find).toHaveBeenCalled();
      expect(mockSymptomModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Symptom by ID', async () => {
      const mockSymptom = { _id: '1', name: 'Test Symptom' };
      mockSymptomModel.findById.mockReturnValue(mockSymptom);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Symptom fetch successfully',
        data: mockSymptom,
      });
      expect(mockSymptomModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Symptom not found', async () => {
      mockSymptomModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Symptom fetch successfully',
        data: null,
      });
      // expect(result).toBeNull();
    });
  });

  describe('findSymptoms', () => {
    it('should return all symptoms with translated fields', async () => {
      const symptoms = [
        { _id: '1', title: 'Cough' },
        { _id: '2', title: 'Fever' },
      ];
      const translatedFields = [
        { _id: '1', title: 'Tosse' },
        { _id: '2', title: 'Febre' },
      ];

      mockSymptomModel.find.mockResolvedValue(symptoms);
      mockLanguageService.getSymptomTranslatedFields
        .mockResolvedValueOnce(translatedFields[0])
        .mockResolvedValueOnce(translatedFields[1]);

      const result = await service.findSymptoms('pt');

      expect(mockSymptomModel.find).toHaveBeenCalled();
      expect(
        mockLanguageService.getSymptomTranslatedFields,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockLanguageService.getSymptomTranslatedFields,
      ).toHaveBeenCalledWith(expect.any(Object), 'pt');
      expect(result).toEqual({
        statusCode: 200,
        data: translatedFields,
        message: 'Symptom fetch successfully',
      });
    });

    it('should default to "en" language if no lang is provided', async () => {
      mockSymptomModel.find.mockResolvedValue([]);
      await service.findSymptoms('');

      expect(
        mockLanguageService.getSymptomTranslatedFields,
      ).not.toHaveBeenCalled();
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        expect.any(String),
        [],
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated Symptom', async () => {
      const updatedSymptom = { _id: '1', category: 'Updated Symptom' };
      mockSymptomModel.findByIdAndUpdate.mockResolvedValue(updatedSymptom);

      const result = await service.update('1', { category: 'Updated Symptom' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Symptom updated successfully',
        data: updatedSymptom,
      });
      expect(mockSymptomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { category: 'Updated Symptom' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Symptom by ID', async () => {
      mockSymptomModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockSymptomModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Symptom deleted successfully',
        data: [],
      });
    });
  });
});
