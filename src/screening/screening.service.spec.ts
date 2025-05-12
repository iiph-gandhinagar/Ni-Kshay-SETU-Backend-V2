import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { ScreeningService } from './screening.service';
const mockScreeningModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Block' }),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockSymptomModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ category: '1' }),
    }),
  }),
};

const mockCountryModel = {
  findOne: jest.fn(),
};

const mockStateModel = {
  findOne: jest.fn(),
};

const mockDistrictModel = {
  findOne: jest.fn(),
};

const mockBlockModel = {
  findOne: jest.fn(),
};

const mockCadreModel = {
  findOne: jest.fn(),
};

const mockAlgorithmTreatmentModel = {
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ category: '1' }),
    }),
  }),
};

const mockAlgorithmDiagnosisModel = {
  findOne: jest.fn(),
};

const mockHealthFacilityModel = {
  findOne: jest.fn(),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('ScreeningService', () => {
  let service: ScreeningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScreeningService,
        { provide: getModelToken('Screening'), useValue: mockScreeningModel },
        { provide: getModelToken('Symptom'), useValue: mockSymptomModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        {
          provide: getModelToken('AlgorithmTreatment'),
          useValue: mockAlgorithmTreatmentModel,
        },
        {
          provide: getModelToken('AlgorithmDiagnosis'),
          useValue: mockAlgorithmDiagnosisModel,
        },
        {
          provide: getModelToken('Subscriber'),
          useValue: mockSubscriberModel,
        },
        {
          provide: getModelToken('HealthFacility'),
          useValue: mockHealthFacilityModel,
        },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<ScreeningService>(ScreeningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeScreeningTool', () => {
    it('should correctly store screening tool data', async () => {
      // Mock data
      const mockRequest = {
        symptomSelected: ['symptom1', 'symptom2'],
        height: 170,
        weight: 65,
        age: 25,
      };

      mockSymptomModel.findById.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ category: '1' }), // Correct chaining for exec()
        })),
      }));

      mockAlgorithmDiagnosisModel.findOne.mockResolvedValue({ _id: 'tb123' });
      mockAlgorithmTreatmentModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ _id: 'treatment123' }), // Correct chaining for exec()
        })),
      }));
      mockSubscriberModel.findOne.mockResolvedValue({ _id: 'user123' });
      mockScreeningModel.create.mockResolvedValue({});

      // Call function
      const result = await service.storeScreeningTool(mockRequest);

      // Expectations
      expect(result).toEqual({
        statusCode: 200,
        message: 'Screening Tool Result!',
        data: expect.objectContaining({
          BMI: expect.any(String),
          isTb: expect.any(Boolean),
          detectedTb: expect.any(String),
          nutritionTitle: expect.any(String),
          tbId: expect.any(String),
        }),
      });

      expect(mockSymptomModel.findById).toHaveBeenCalledTimes(
        mockRequest.symptomSelected.length,
      );
      expect(mockAlgorithmDiagnosisModel.findOne).toHaveBeenCalled();
      expect(mockAlgorithmTreatmentModel.findOne).toHaveBeenCalled();
      expect(mockSubscriberModel.findOne).toHaveBeenCalled();
      expect(mockScreeningModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          age: 25,
          weight: 65,
          height: 170,
          symptomSelected: mockRequest.symptomSelected,
          isTb: expect.any(Boolean),
          symptomName: expect.any(String),
        }),
      );
    });
  });
});
