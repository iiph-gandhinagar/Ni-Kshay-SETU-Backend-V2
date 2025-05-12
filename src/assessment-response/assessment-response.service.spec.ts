import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AssessmentResponseAggregate } from '../common/pagination/assessmentResponseAggregation.service';
import { AssessmentResponseService } from './assessment-response.service';
process.env.MONGO_URL = 'mongodb://localhost:27017/test-db';

jest.mock('mongodb', () => {
  const mCollection = {
    find: jest.fn().mockReturnValue({
      toArray: jest
        .fn()
        .mockResolvedValue([
          { assessments: [{ pending: 'no' }, { pending: 'yes' }] },
          { assessments: [{ pending: 'no' }] },
        ]),
    }),
  };
  const mDb = { collection: jest.fn().mockReturnValue(mCollection) };
  const mClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mDb),
    close: jest.fn(),
  };
  return { MongoClient: jest.fn(() => mClient) };
});

jest.mock('../common/pagination/assessmentResponseAggregation.service', () => ({
  AssessmentResponseAggregate: jest.fn(),
}));
const mockAssessmentResponseModel = {
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
  aggregate: jest.fn(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAssessmentModel = {
  findById: jest.fn(),
};

const mockQuestionBankModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AssessmentResponseService', () => {
  let service: AssessmentResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentResponseService,
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        {
          provide: getModelToken('QuestionBank'),
          useValue: mockQuestionBankModel,
        },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AssessmentResponseService>(AssessmentResponseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Assessment Response', async () => {
      const createAssessmentResponseDto = {
        assessmentId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        TotalMarks: 10,
        totalTime: 20,
        obtainedMarks: 10,
        attempted: 10,
        rightAnswer: 10,
        wrongAnswer: 0,
        skip: 0,
        isCalculated: true,
      };
      const mockAssessmentResponse = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAssessmentResponseDto,
      };
      mockAssessmentModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ timeToComplete: 20 }),
      });
      mockAssessmentResponseModel.create.mockResolvedValue(
        mockAssessmentResponse,
      );

      const result = await service.create(createAssessmentResponseDto);
      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(
        expect.objectContaining({}),
      );
      expect(mockAssessmentResponseModel.create).toHaveBeenCalledWith(
        createAssessmentResponseDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Response Created successfully',
        data: mockAssessmentResponse,
      });
    });
  });
  describe('findAll', () => {
    it('should return Assessment Response with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockSurveyHistory = [
        { name: 'Assessment Response 1' },
        { name: 'Assessment Response 2' },
      ];
      const mockAdminUser = {
        _id: userId,
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue({});
      (AssessmentResponseAggregate as jest.Mock).mockResolvedValue(
        mockSurveyHistory,
      );

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(AssessmentResponseAggregate).toHaveBeenCalledWith(
        mockAssessmentResponseModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSurveyHistory);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null), // Simulating no user found
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException('Admin User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllResponse', () => {
    it('should return assessment Response data', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockAdminUser = {
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      const mockQuery = { 'userId.name': /test/i };

      const mockPaginationDto: any = {
        state: '',
        district: '',
        cadre: '',
        country: '',
      };

      const mockAggregatedData = [{ name: 'Test User', totalMarks: 20 }];

      // Mock model behavior
      mockAdminUserModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockAssessmentResponseModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregatedData),
      });

      const result = await service.getAllResponse(
        mockPaginationDto,
        '6666c830eb18953046b1b56b',
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockFilterService.filter).toHaveBeenCalledWith({
        ...mockPaginationDto,
        adminStateId: 'state123',
        adminDistrictId: 'district123',
      });

      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Response fetch successfully',
        data: mockAggregatedData,
      });
    });
  });

  describe('storeAssessmentResponse', () => {
    it('should update an existing assessment response when idFilter is provided', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const storeQuestionAnswerDto = {
        assessmentId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        answer: {
          questionId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
          answer: 'Answer',
          isCorrect: true,
          isSubmit: true,
          selectedOption: 'A',
        },
      };
      const idFilter = {
        idFilter: new mongoose.Types.ObjectId().toString(),
      };
      const updatedDoc = { _id: 'updatedId', history: [] };
      mockAssessmentResponseModel.findByIdAndUpdate.mockResolvedValue(
        updatedDoc,
      );

      const result = await service.storeAssessmentResponse(
        userId,
        storeQuestionAnswerDto,
        idFilter,
      );

      expect(mockAssessmentResponseModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Store Question Answer Successfully!!',
        data: updatedDoc,
      });
    });

    it('should create a new assessment response when idFilter is not provided', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const questionId = new mongoose.Types.ObjectId();
      const assessmentId = new mongoose.Types.ObjectId();

      const storeQuestionAnswerDto = {
        assessmentId,
        answer: {
          questionId,
          answer: 'Answer',
          isCorrect: false,
          isSubmit: true,
          selectedOption: 'B',
        },
      };

      const mockUser = { _id: userId };
      const mockAnswer = { _id: questionId };

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockQuestionBankModel.findById.mockResolvedValue(mockAnswer);
      mockAssessmentResponseModel.create(storeQuestionAnswerDto);

      const result = await service.storeAssessmentResponse(
        userId,
        storeQuestionAnswerDto,
        {},
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockQuestionBankModel.findById).toHaveBeenCalledWith(questionId);
      expect(result).toMatchObject({
        statusCode: 200,
        message: 'Assessment Response Created successfully',
        data: {
          TotalMarks: 10,
          attempted: 10,
          isCalculated: true,
          obtainedMarks: 10,
          rightAnswer: 10,
          skip: 0,
          totalTime: 20,
          wrongAnswer: 0,
        },
      });
    });
  });

  describe('getSubscriberAssessmentDetails', () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const assessmentId = new mongoose.Types.ObjectId().toString();
    const mockAssessmentTime = { timeToComplete: 20 }; // minutes
    const mockAssessmentQuestions = { questions: new Array(10).fill({}) };
    it('should return response with remaining time if assessment is available and not expired', async () => {
      const createdAt = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago

      const isAvailableMock = {
        _id: new mongoose.Types.ObjectId(),
        createdAt,
        totalTime: 20,
        isCalculated: false,
        history: [{ questionId: 'q1', answer: 'A' }],
      };

      mockAssessmentModel.findById
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentTime),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentQuestions),
        });

      mockAssessmentResponseModel.findOne.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValueOnce(isAvailableMock),
        }),
      });

      const result = await service.getSubscriberAssessmentDetails(
        userId,
        assessmentId,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Progress Details',
        data: {
          isAssessmentAttempted: 0,
          isAssessmentExpired: 0,
          remainingTime: expect.any(Number),
          answers: isAvailableMock.history,
          _id: isAvailableMock._id,
        },
      });
    });

    it('should return expired response if completion time is passed', async () => {
      const createdAt = new Date(Date.now() - 25 * 60 * 1000); // 25 mins ago

      const isAvailableMock = {
        _id: new mongoose.Types.ObjectId(),
        createdAt,
        totalTime: 20,
        isCalculated: false,
        history: [],
      };

      mockAssessmentModel.findById
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentTime),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentQuestions),
        });

      mockAssessmentResponseModel.findOne.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValueOnce(isAvailableMock),
        }),
      });

      const result = await service.getSubscriberAssessmentDetails(
        userId,
        assessmentId,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Progress Details',
        data: {
          isAssessmentAttempted: 1,
          isAssessmentExpired: 1,
          remainingTime: 0,
          answers: [],
          _id: isAvailableMock._id,
        },
      });
    });

    it('should throw error if assessment was already attempted in the last 24 hours', async () => {
      mockAssessmentModel.findById
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentTime),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentQuestions),
        });

      mockAssessmentResponseModel.findOne
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValueOnce(null),
          }),
        })
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValueOnce({ createdAt: new Date() }),
          }),
        });

      await expect(
        service.getSubscriberAssessmentDetails(userId, assessmentId),
      ).rejects.toThrow(
        'You are not allowed to retake an assessment that has already been completed.',
      );
    });

    it('should create new response if no recent assessment exists', async () => {
      mockAssessmentModel.findById
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentTime),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockAssessmentQuestions),
        });

      mockAssessmentResponseModel.findOne
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValueOnce(null),
          }),
        })
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValueOnce(null),
          }),
        });

      const savedDoc = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      };

      mockAssessmentResponseModel.create(savedDoc);

      const result = await service.getSubscriberAssessmentDetails(
        userId,
        assessmentId,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Progress Details',
        data: {
          isAssessmentAttempted: 0,
          isAssessmentExpired: 0,
          remainingTime: mockAssessmentTime.timeToComplete * 60,
          answers: [],
          _id: savedDoc._id,
        },
      });
    });
  });

  describe('getUserResult', () => {
    const userId = new mongoose.Types.ObjectId(
      '6666c830eb18953046b1b56b',
    ).toString();
    const userAssessmentId = new mongoose.Types.ObjectId(
      '6666c830eb18953046b1b56b',
    ).toString();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw 404 if assessment is not found', async () => {
      mockAssessmentResponseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getUserResult(userId, userAssessmentId),
      ).rejects.toThrow('Assessment not found');
    });

    it('should return stored assessment if already calculated', async () => {
      const mockAssessment = {
        _id: userAssessmentId,
        obtainedMarks: 8,
        attempted: 10,
        rightAnswer: 8,
        wrongAnswer: 2,
        skip: 0,
        isCalculated: true,
        totalTime: 20,
        totalMarks: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        assessmentId: {
          _id: new mongoose.Types.ObjectId(),
          title: { en: 'Mock Assessment' },
        },
      };

      mockAssessmentResponseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAssessment),
      });

      const result = await service.getUserResult(userId, userAssessmentId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Result!',
        data: mockAssessment,
      });
    });

    it('should calculate and return result if not calculated yet', async () => {
      const mockAssessment = {
        _id: userAssessmentId,
        assessmentId: new mongoose.Types.ObjectId(),
        isCalculated: false,
      };

      const mockCalculatedData = {
        obtainedMarks: 9,
        totalMarks: 10,
        rightAnswer: 9,
        wrongAnswer: 1,
        skip: 0,
      };

      mockAssessmentResponseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAssessment),
      });

      jest
        .spyOn(service, 'calculateMarks')
        .mockResolvedValue(mockCalculatedData);

      const result = await service.getUserResult(userId, userAssessmentId);

      expect(service.calculateMarks).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(userId),
        mockAssessment.assessmentId,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Result!',
        data: mockCalculatedData,
      });
    });
  });

  describe('getNotCalculatedAssessment', () => {
    const mockAssessments = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        assessmentId: new mongoose.Types.ObjectId(),
        totalTime: 1, // 1 minute
        createdAt: new Date(Date.now() - 2 * 60000), // Created 2 mins ago (expired)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        assessmentId: new mongoose.Types.ObjectId(),
        totalTime: 5, // 5 minutes
        createdAt: new Date(Date.now() - 1 * 60000), // Created 1 min ago (not expired)
      },
    ];
    it('should call calculateMarks for expired assessments only', async () => {
      // Only expired one returned
      mockAssessmentResponseModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([mockAssessments[0]]),
      });

      const calculateMarksSpy = jest
        .spyOn(service, 'calculateMarks')
        .mockResolvedValue(true);

      await service.getNotCalculatedAssessment();

      expect(calculateMarksSpy).toHaveBeenCalledWith(
        mockAssessments[0].userId,
        mockAssessments[0].assessmentId,
      );
    });

    it('should return false if current assessment has not expired', async () => {
      // Only unexpired one returned
      mockAssessmentResponseModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([mockAssessments[1]]),
      });

      const calculateMarksSpy = jest
        .spyOn(service, 'calculateMarks')
        .mockResolvedValue(true);

      const result = await service.getNotCalculatedAssessment();

      expect(calculateMarksSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle multiple assessments: stop on non-expired', async () => {
      // First is expired, second is not
      mockAssessmentResponseModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(mockAssessments),
      });

      const calculateMarksSpy = jest
        .spyOn(service, 'calculateMarks')
        .mockResolvedValue(true);

      const result = await service.getNotCalculatedAssessment();

      // Should call only once (for the first expired item), then stop on non-expired
      expect(calculateMarksSpy).toHaveBeenCalledTimes(1);
      expect(calculateMarksSpy).toHaveBeenCalledWith(
        mockAssessments[0].userId,
        mockAssessments[0].assessmentId,
      );
      expect(result).toBe(false);
    });

    it('should do nothing if no not-calculated assessments found', async () => {
      mockAssessmentResponseModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([]),
      });

      const calculateMarksSpy = jest
        .spyOn(service, 'calculateMarks')
        .mockResolvedValue(true);

      const result = await service.getNotCalculatedAssessment();

      expect(calculateMarksSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined(); // No return statement if list is empty
    });
  });

  describe('proAssessmentScore', () => {
    it('should return pro assessment score from mocked MongoDB', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const assessmentId = '6666c830eb18953046b1b56b';

      const result = await service.proAssessmentScore(userId, assessmentId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Result',
        data: [],
      });
    });
  });
});
