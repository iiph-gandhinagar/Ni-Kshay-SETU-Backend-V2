import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import mongoose from 'mongoose';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { AssessmentService } from './assessment.service';
import { StoreAssessmentEnrollmentDto } from './dto/store-assessment-enrollment.dto';
import { StoreProAssessmentDto } from './dto/store-pro-assessment.dto';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

jest.mock('axios');

const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockFindOne = jest.fn();
const mockCollection = jest.fn().mockReturnValue({ findOne: mockFindOne });
const mockDb = jest.fn().mockReturnValue({ collection: mockCollection });

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      db: mockDb,
      close: mockClose,
    })),
    ObjectId: jest.requireActual('mongodb').ObjectId,
  };
});

const mockAssessmentModel = {
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

const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn().mockResolvedValue([]),
};
const mockFirebaseService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
};

const mockQuestionBankModel = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn(),
};

const mockAssessmentEnrollmentModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockUserDeviceTokenModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockUserNotificationModel = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
};

const mockCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockStateModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockCountryModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockDistrictModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockPrimaryCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
};

const mockOldAssessmentResultModel = {
  findOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AssessmentService', () => {
  let service: AssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('QuestionBank'),
          useValue: mockQuestionBankModel,
        },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        {
          provide: getModelToken('AssessmentEnrollment'),
          useValue: mockAssessmentEnrollmentModel,
        },
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        {
          provide: getModelToken('PrimaryCadre'),
          useValue: mockPrimaryCadreModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        {
          provide: getModelToken('OldAssessmentResult'),
          useValue: mockOldAssessmentResultModel,
        },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: FirebaseService, useValue: mockFirebaseService },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create an assessment and return response', async () => {
      const userId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      ).toString();

      const newQuestionId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );
      const savedQuestion = { _id: newQuestionId };

      const createAssessmentDto: any = {
        countryId: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ).toString(),
        stateId: ['6666c830eb18953046b1b56b'],
        districtId: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
        blockId: [],
        cadreId: ['6666c830eb18953046b1b56b'],
        healthFacilityId: ['6666c830eb18953046b1b56b'],
        certificateType: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ).toString(),
        newQuestions: [{ text: 'Sample Question?', type: 'MCQ' }],
        questions: [
          new mongoose.Types.ObjectId('6666c830eb18953046b1b56b').toString(),
        ],
      };
      mockQuestionBankModel.create.mockResolvedValue(savedQuestion);
      mockAssessmentModel.create.mockResolvedValue({
        _id: '6666c830eb18953046b1b56b',
      });

      const result = await service.create(createAssessmentDto, userId);

      expect(mockAssessmentModel.create).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Created successfully',
        data: { _id: '6666c830eb18953046b1b56b' },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated assessments with populated fields', async () => {
      const paginationDto: any = {
        page: 1,
        limit: 10,
        state: '',
      };
      const userId = 'user123';

      const query = { some: 'filter' };
      const updatedQuery = { some: 'adminFilter' };
      const paginatedResult = {
        docs: [{ title: 'Assessment 1' }],
        totalDocs: 1,
        page: 1,
        limit: 10,
      };

      mockFilterService.filter = jest.fn().mockResolvedValue(query);
      mockAdminService.adminRoleFilter = jest
        .fn()
        .mockResolvedValue(updatedQuery);
      (paginate as jest.Mock).mockResolvedValue(paginatedResult);

      const result = await service.findAll(paginationDto, userId);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockAdminService.adminRoleFilter).toHaveBeenCalledWith(
        userId,
        query,
        'assessment',
      );
      expect(paginate).toHaveBeenCalledWith(
        mockAssessmentModel,
        paginationDto,
        expect.any(Array), // populate options
        updatedQuery,
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('assessmentFilter', () => {
    it('Should Return All Assessment Title', async () => {
      const mockAssessment = [
        { title: 'Assessment 1' },
        { title: 'Assessment 2' },
      ];
      mockAssessmentModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAssessment),
      });

      const result = await service.assessmentFilter();

      expect(mockAssessmentModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Fetched Successfully!',
        data: mockAssessment,
      });
    });
  });

  describe('findOne', () => {
    const mockAssessment = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Assessment A',
      countryId: { title: 'India' },
      stateId: { title: 'State X' },
      districtId: { title: 'District Y' },
      cadreId: { title: 'Cadre Z' },
      blockId: { title: 'Block W' },
      healthFacilityId: { healthFacilityCode: 'HF001' },
      questions: [],
    };
    it('should return a populated assessment by ID', async () => {
      const id = mockAssessment._id.toString();
      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAssessment),
        }),
      });
      const result = await service.findOne(id);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(id);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: mockAssessment,
      });
    });
  });

  describe('update', () => {
    const mockAssessmentId = '6666c830eb18953046b1b56b';
    const mockObjectId = new mongoose.Types.ObjectId(mockAssessmentId);

    const mockUpdateDto = {
      countryId: mockObjectId,
      stateId: [mockObjectId],
      districtId: [mockObjectId],
      blockId: [mockObjectId],
      healthFacilityId: [mockObjectId],
      cadreId: [mockObjectId],
    };

    const mockUpdatedDoc = {
      _id: mockAssessmentId,
      title: 'Updated',
    };
    it('should throw BAD_REQUEST if assessment response exists', async () => {
      mockAssessmentResponseModel.countDocuments.mockResolvedValue(1);

      await expect(
        service.update(mockAssessmentId, mockUpdateDto),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'assessment cant delete',
            errors: 'Assessment cant delete',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockAssessmentResponseModel.find).toHaveBeenCalledWith({
        assessmentId: mockAssessmentId,
      });
      expect(mockAssessmentResponseModel.countDocuments).toHaveBeenCalled();
    });

    it('should update assessment and return response if no responses exist', async () => {
      mockAssessmentResponseModel.countDocuments.mockResolvedValue(0);
      mockAssessmentModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedDoc),
      });
      const result = await service.update(mockAssessmentId, mockUpdateDto);

      expect(mockAssessmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAssessmentId,
        expect.any(Object),
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment updated successfully',
        data: mockUpdatedDoc,
      });
    });
  });

  describe('remove', () => {
    const mockAssessmentId = '6666c830eb18953046b1b56b';
    it('should throw BAD_REQUEST if assessment response exists', async () => {
      mockAssessmentResponseModel.countDocuments.mockResolvedValue(1);

      await expect(service.remove(mockAssessmentId)).rejects.toThrow(
        new HttpException(
          {
            message: 'assessment cant delete',
            errors: 'Assessment cant delete',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockAssessmentResponseModel.find).toHaveBeenCalledWith({
        assessmentId: mockAssessmentId,
      });
      expect(mockAssessmentResponseModel.countDocuments).toHaveBeenCalled();
    });
    it('Should Remove assessment', async () => {
      mockAssessmentResponseModel.countDocuments.mockResolvedValue(0);
      mockAssessmentModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockAssessmentModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment deleted successfully',
        data: [],
      });
    });
  });

  describe('storeWeeklyGoal', () => {
    const mockUserId = '6666c830eb18953046b1b56b';
    const mockGoal = 5;
    const mockLang = 'en';
    const mockStoreWeeklyGoalDto = { goal: mockGoal };
    it('should throw UNAUTHORIZED if user not found', async () => {
      mockSubscriberModel.findById.mockResolvedValue(null);

      await expect(
        service.storeWeeklyGoal(mockUserId, mockStoreWeeklyGoalDto, mockLang),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'User Not Found',
            errors: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should update weekly goal and call external API', async () => {
      const mockCadreId = '123456789012345678901234';
      const mockCadreGroupId = 'group123';
      const mockAudienceId = 'audience456';

      // First call: check user exists
      mockSubscriberModel.findById.mockResolvedValueOnce({ _id: mockUserId });

      // Second call: get cadreId
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ cadreId: mockCadreId }),
      });

      // Cadre model: get cadreGroup
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreGroup: mockCadreGroupId }),
      });

      // Primary Cadre model: get audienceId
      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ audienceId: mockAudienceId }),
      });

      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue({});
      jest.spyOn(axios, 'post').mockResolvedValue({});

      const result = await service.storeWeeklyGoal(
        mockUserId,
        mockStoreWeeklyGoalDto,
        mockLang,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { 'userContext.weeklyAssessmentCount': mockGoal },
        { new: true },
      );
      expect(mockCadreModel.findById).toHaveBeenCalledWith(mockCadreId);
      expect(mockPrimaryCadreModel.findById).toHaveBeenCalledWith(
        mockCadreGroupId,
      );
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/update_user_preferences'),
        {
          user_id: new mongoose.Types.ObjectId(mockUserId),
          assessment_count: mockGoal,
          lang: mockLang,
          cadre_id: mockAudienceId,
        },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Weekly Goal Updated Successfully!',
        data: [],
      });
    });
  });

  describe('sendInitialNotification', () => {
    const mockAssessmentId = '6666c830eb18953046b1b56b';
    const mockAdminUserId = '6666c830eb18953046b1b56b';

    const mockAssessment = {
      _id: mockAssessmentId,
      title: 'Health Survey',
      timeToComplete: 30,
      fromDate: new Date(), // test with fromDate defined
    };

    const mockSubscribers = [
      {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        name: 'Test User',
        email: 'Test@gmail.com',
      },
      {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        name: 'Test user 2',
        email: 'test2@gmail.com',
      },
    ];

    // Extract only the _id values from mockSubscribers
    const mockUserIds = mockSubscribers.map((user) => user._id);

    const mockDeviceTokens = [
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ];

    const mockNotification = {
      _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
    };
    it('should build notification, save it, and add to queue when device tokens exist', async () => {
      mockAssessmentModel.findById.mockResolvedValue(mockAssessment);
      jest.spyOn(service, 'buildQuery').mockResolvedValue({ some: 'query' });
      mockSubscriberModel.find.mockResolvedValue(mockSubscribers);

      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDeviceTokens),
      });

      mockUserNotificationModel.create.mockResolvedValue(mockNotification);

      const result = await service.sendInitialNotification(
        mockAssessmentId,
        mockAdminUserId,
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(
        mockAssessmentId,
      );
      expect(service.buildQuery).toHaveBeenCalledWith(mockAssessment);
      expect(mockSubscriberModel.find).toHaveBeenCalled();
      expect(mockUserDeviceTokenModel.find).toHaveBeenCalledWith({
        userId: { $in: mockUserIds },
      });
      expect(mockUserNotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Assessment',
          description: expect.stringContaining(mockAssessment.title),
          automaticNotificationType: 'Future Assessment',
          link: expect.stringContaining('currentAssessmentScreen'),
        }),
      );
      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b', // Pass the mockNotificationId.toString()
        expect.objectContaining({
          title: 'New Assessment',
          description: expect.stringContaining(mockAssessment.title),
          automaticNotificationType: 'Future Assessment',
        }),
        mockDeviceTokens,
        'assessment',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Notifications are in Queue!!',
        data: [],
      });
    });

    it('should fallback to Current Assessment if fromDate is undefined or null', async () => {
      const assessmentNoFromDate = { ...mockAssessment, fromDate: undefined };
      mockAssessmentModel.findById.mockResolvedValueOnce(assessmentNoFromDate);

      await service.sendInitialNotification(mockAssessmentId, mockAdminUserId);

      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b', // Pass the mockNotificationId.toString()
        expect.objectContaining({
          title: 'New Assessment',
          description: expect.stringContaining(mockAssessment.title),
          automaticNotificationType: 'Future Assessment',
        }),
        mockDeviceTokens,
        'assessment',
      );
    });

    it('should return error when no users are found', async () => {
      // Mock the subscriber model to return an empty array (no users found)
      mockSubscriberModel.find.mockResolvedValueOnce([]);

      try {
        await service.sendInitialNotification(
          mockAssessmentId,
          mockAdminUserId,
        );
      } catch (e) {
        expect(e.statusCode).toBe(400);
        expect(e.message).toBe('No user found with the provided ID');
      }
    });

    it('should handle errors gracefully if notification saving fails', async () => {
      // Mock the error response for `create`
      mockUserNotificationModel.create.mockRejectedValueOnce(
        new Error('Error saving notification'),
      );

      // Ensure the try/catch block handles the error properly
      try {
        await service.sendInitialNotification(
          mockAssessmentId,
          mockAdminUserId,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Error saving notification');
      }
    });
  });

  describe('storeProAssessmentResult', () => {
    it('should store Pro assessment result successfully', async () => {
      const mockUserId = 'user123';
      const mockPayload = {
        assessmentId: 'assessment123',
        answers: ['answer1', 'answer2'],
      };
      const storeProAssessmentDto: StoreProAssessmentDto = {
        payload: mockPayload,
      };

      // Mocking axios.post to resolve successfully
      jest.spyOn(axios, 'post').mockResolvedValue({});

      // Call the method
      const result = await service.storeProAssessmentResult(
        mockUserId,
        storeProAssessmentDto,
      );

      // Assertions
      expect(axios.post).toHaveBeenCalledWith(
        process.env.ASSESSMENT_URL + '/update_assessment_submission',
        mockPayload,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Pro Assessment Result!',
        data: [],
      });
    });
    it('should handle error if external API call fails', async () => {
      const mockUserId = 'user123';
      const mockPayload = {
        assessmentId: 'assessment123',
        answers: ['answer1', 'answer2'],
      };
      const storeProAssessmentDto: StoreProAssessmentDto = {
        payload: mockPayload,
      };

      // Mocking axios.post to reject with an error
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('API call failed'));
      // axios.post.mockRejectedValue(new Error('API call failed'));

      // Call the method and catch the error
      try {
        await service.storeProAssessmentResult(
          mockUserId,
          storeProAssessmentDto,
        );
      } catch (error) {
        // Assertions
        expect(error.message).toBe('API call failed');
      }
    });

    it('should log the payload correctly', async () => {
      const mockUserId = 'user123';
      const mockPayload = {
        assessmentId: 'assessment123',
        answers: ['answer1', 'answer2'],
      };
      const storeProAssessmentDto: StoreProAssessmentDto = {
        payload: mockPayload,
      };

      // Mocking axios.post to resolve successfully
      jest.spyOn(axios, 'post').mockResolvedValue({});

      // Use jest.spyOn to spy on console.log
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // Call the method
      await service.storeProAssessmentResult(mockUserId, storeProAssessmentDto);

      // Assertions for logging the payload
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('getAllAssessment', () => {
    it('should return valid assessments for the user', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockUser = { _id: mockUserId, name: 'Test User' };
      const now = new Date();
      const mockCompletedAssessments = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          isCalculated: true,
          createdAt: now,
        },
      ];
      const mockValidAssessments = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          assessmentType: 'Ongoing',
          fromDate: new Date(),
          toDate: new Date(new Date().getTime() + 86400000),
        },
      ];
      const mockPendingAssessments = [
        { assessmentId: '6666c830eb18953046b1b56b', pending: 'yes' },
      ];

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockAssessmentResponseModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCompletedAssessments),
      });
      mockAssessmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockValidAssessments),
      });

      mockFindOne.mockResolvedValue({
        assessments: mockPendingAssessments,
        created_at: now,
        updated_at: now,
      });

      const result = await service.getAllAssessment(mockUserId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockAssessmentResponseModel.find).toHaveBeenCalled();
      expect(mockAssessmentModel.find).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalled();
      expect(mockDb).toHaveBeenCalledWith('ns-rewamp-backend');
      expect(mockCollection).toHaveBeenCalledWith('userassessments');
      expect(mockFindOne).toHaveBeenCalledWith({ user_id: mockUserId });

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: expect.arrayContaining([
          expect.objectContaining({ assessmentId: '6666c830eb18953046b1b56b' }),
          expect.objectContaining({ assessmentId: '6666c830eb18953046b1b56b' }),
        ]),
      });
    });
    it('should throw error if user not found', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      mockSubscriberModel.findById.mockResolvedValue(null);

      await expect(service.getAllAssessment(mockUserId)).rejects.toThrow(
        "Cannot read properties of null (reading 'cadreId')", // or customize this if you throw your own error
      );
    });
    it('should return assessments when there are no completed assessments', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const now = new Date();
      const mockUser = { _id: mockUserId, name: 'Test User' };

      const mockValidAssessments = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          assessmentType: 'Ongoing',
          fromDate: now,
          toDate: new Date(now.getTime() + 86400000),
        },
      ];

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockAssessmentResponseModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      }); // No completed assessments
      mockAssessmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockValidAssessments),
      });

      mockFindOne.mockResolvedValue(null); // No pending assessments

      const result = await service.getAllAssessment(mockUserId);

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: expect.arrayContaining([
          expect.objectContaining({ assessmentId: '6666c830eb18953046b1b56b' }),
        ]),
      });
    });
    it('should throw HttpException when MongoDB connection fails', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';
      const mockUser = { _id: mockUserId };

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockAssessmentResponseModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      mockAssessmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      });

      mockFindOne.mockRejectedValue(new Error('MongoDB failure'));

      await expect(service.getAllAssessment(mockUserId)).rejects.toThrow(
        'Pro Assessment Error!',
      );
    });
  });

  describe('getAllPastAssessment', () => {
    it('should return combined past and given assessments', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      const pastAssessmentMock = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          userAssessmentId: '6666c830eb18953046b1b56b',
          assessmentDetails: {
            title: 'Mock Assessment',
            questions: [],
            timeToComplete: 30,
            active: true,
          },
        },
      ];

      const givenAssessmentMock = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          pending: 'no',
        },
      ];

      mockAssessmentModel.aggregate.mockResolvedValue(pastAssessmentMock);
      mockFindOne.mockResolvedValue({
        assessments: givenAssessmentMock,
      });

      // const expected = [...pastAssessmentMock, ...givenAssessmentMock];

      const result = await service.getAllPastAssessment(mockUserId);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockDb).toHaveBeenCalledWith('ns-rewamp-backend');
      expect(mockCollection).toHaveBeenCalledWith('userassessments');
      expect(mockFindOne).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: undefined,
      });
    });
    it('should return only past assessments when no given found', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      const pastAssessmentMock = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          userAssessmentId: '6666c830eb18953046b1b56b',
          assessmentDetails: {
            title: 'Mock Past',
            questions: [],
            timeToComplete: 30,
            active: true,
          },
        },
      ];

      mockAssessmentModel.aggregate.mockResolvedValue(pastAssessmentMock);
      mockFindOne.mockResolvedValue({
        assessments: [],
      });

      const result = await service.getAllPastAssessment(mockUserId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: undefined,
      });
    });
    it('should log error and return only past assessments if MongoDB fails', async () => {
      const mockUserId = '6666c830eb18953046b1b56b';

      const pastAssessmentMock = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          userAssessmentId: '6666c830eb18953046b1b56b',
          assessmentDetails: {
            title: 'Mock Past',
            questions: [],
            timeToComplete: 30,
            active: true,
          },
        },
      ];

      mockAssessmentModel.aggregate.mockResolvedValue(pastAssessmentMock);
      mockFindOne.mockRejectedValue(new Error('MongoDB error'));

      const result = await service.getAllPastAssessment(mockUserId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: undefined,
      });
    });
  });

  describe('futureAssessment', () => {
    it('should return future assessments for the user', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const mockUser = {
        _id: userId,
        cadreId: '6666c830eb18953046b1b56b',
        stateId: '6666c830eb18953046b1b56b',
        districtId: null,
        countryId: null,
      };

      const mockQuery = {
        active: true,
        cadreId: { $in: [mockUser.cadreId] },
        stateId: { $in: [mockUser.stateId] },
      };

      const mockFutureAssessments = [
        {
          _id: '6666c830eb18953046b1b56b',
          assessmentType: 'planned',
          fromDate: new Date(),
          title: 'Mock Future Assessment',
        },
      ];

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      service.buildAssessmentQuery = jest.fn().mockResolvedValue(mockQuery);

      mockAssessmentModel.find.mockReturnThis();
      mockAssessmentModel.populate.mockResolvedValue(mockFutureAssessments);

      const result = await service.futureAssessment(userId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(service.buildAssessmentQuery).toHaveBeenCalledWith(mockUser);
      expect(mockAssessmentModel.find).toHaveBeenCalledWith({
        ...mockQuery,
        assessmentType: 'planned',
        fromDate: { $gte: expect.any(Date) },
      });
      expect(mockAssessmentModel.populate).toHaveBeenCalledWith({
        path: 'questions',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: mockFutureAssessments,
      });
    });
  });

  describe('assessmentPerformance', () => {
    it('should return assessment performance for the user', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const mockUser = { _id: userId };
      const mockQuery = { cadreId: '6666c830eb18953046b1b56b' };

      const mockAssessments = [
        {
          _id: '6666c830eb18953046b1b56b',
          assessmentType: 'real-time',
          toDate: new Date('2023-01-01'),
        },
        {
          _id: '6666c830eb18953046b1b56b',
          assessmentType: 'planned',
          toDate: new Date('2023-01-01'),
        },
      ];

      const mockResponses = [
        {
          assessmentId: '6666c830eb18953046b1b56b',
          obtainedMarks: 40,
          totalMarks: 50,
        },
        {
          assessmentId: '6666c830eb18953046b1b56b',
          obtainedMarks: 30,
          totalMarks: 50,
        },
      ];

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      service.buildAssessmentQuery = jest.fn().mockResolvedValue(mockQuery);
      mockAssessmentModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAssessments),
      });
      mockAssessmentResponseModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockResponses),
      });

      const expected = {
        totalAssessmentCount: 2,
        completeAssessment: 2,
        accuracy: 140, // ((40/50 + 30/50)/2) = 0.7 -> 70.00
      };

      const result = await service.assessmentPerformance(userId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(service.buildAssessmentQuery).toHaveBeenCalledWith(mockUser);

      expect(mockAssessmentModel.find).toHaveBeenCalledWith({
        ...mockQuery,
        $or: [
          { assessmentType: 'real-time' },
          { assessmentType: 'planned', toDate: { $lt: expect.any(Date) } },
        ],
      });

      expect(mockAssessmentResponseModel.find).toHaveBeenCalledWith({
        userId,
        assessmentId: {
          $in: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
        },
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment fetch successfully',
        data: expected,
      });
    });
  });

  describe('storeAssessmentEnrollment', () => {
    it('should store assessment enrollment response if user exists', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const storeAssessmentEnrollmentDto: StoreAssessmentEnrollmentDto = {
        assessmentId: '6666c830eb18953046b1b56b',
        response: 'Yes',
      };

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: userId }),
        }),
      });

      mockAssessmentEnrollmentModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({}),
      });

      const result = await service.storeAssessmentEnrollment(
        storeAssessmentEnrollmentDto,
        userId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(
        mockAssessmentEnrollmentModel.findOneAndUpdate,
      ).toHaveBeenCalledWith(
        { assessmentId: '6666c830eb18953046b1b56b', userId },
        { response: 'Yes' },
        { new: true, upsert: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Your Response Store Successfully!!',
        data: [],
      });
    });

    it('should throw HttpException if user is not found', async () => {
      const userId = 'nonexistent';
      const storeAssessmentEnrollmentDto = {
        assessmentId: '6666c830eb18953046b1b56b',
        response: 'yes',
      };

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.storeAssessmentEnrollment(storeAssessmentEnrollmentDto, userId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'User Not Found',
            errors: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(
        mockAssessmentEnrollmentModel.findOneAndUpdate,
      ).not.toHaveBeenCalled();
      expect(mockBaseResponse.sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('copyAssessment', () => {
    it('should successfully copy an assessment if found', async () => {
      const assessmentId = 'assessment123';
      const assessmentData = {
        title: { en: 'Original Title' },
        active: true,
        isCopy: false,
      };

      const copiedAssessment = {
        ...assessmentData,
        title: expect.objectContaining({}),
        active: false,
        isCopy: true,
      };

      mockAssessmentModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(assessmentData),
      });
      mockAssessmentModel.create.mockResolvedValue(copiedAssessment);

      const result = await service.copyAssessment(assessmentId);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentModel.create).toHaveBeenCalledWith(copiedAssessment);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment copied successfully',
        data: copiedAssessment,
      });
    });

    it('should throw HttpException if assessment is not found', async () => {
      const assessmentId = 'nonexistent-assessment-id';

      mockAssessmentModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.copyAssessment(assessmentId)).rejects.toThrow(
        new HttpException(
          {
            message: 'Assessment not found',
            errors: 'Assessment not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentModel.create).not.toHaveBeenCalled();
    });
  });

  describe('activeFlagValidation', () => {
    it('should successfully update active flag when assessment is found and fromDate is valid', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const activeFlagDto = { assessmentId, active: true };
      const assessmentData = {
        fromDate: new Date(Date.now() + 60_000), // set 1 minute in the future
        active: false,
      };

      mockAssessmentModel.findById.mockResolvedValue(assessmentData);
      mockAssessmentModel.findByIdAndUpdate.mockResolvedValue({
        ...assessmentData,
        active: true,
      });

      await service.activeFlagValidation(activeFlagDto);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        assessmentId,
        { active: true },
        { new: true },
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Status Update Successfully!',
        [],
      );
    });

    it('should throw HttpException if assessment is not found', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const activeFlagDto = { assessmentId, active: true };

      mockAssessmentModel.findById.mockResolvedValue(null);

      await expect(service.activeFlagValidation(activeFlagDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Assessment not found',
            errors: 'Assessment not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw HttpException if fromDate is in the past', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const activeFlagDto = { assessmentId, active: true };
      const assessmentData = {
        fromDate: new Date(Date.now() - 10000),
        active: false,
      }; // Past date

      mockAssessmentModel.findById.mockResolvedValue(assessmentData);

      await expect(service.activeFlagValidation(activeFlagDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Time up: fromDate is in the past',
            errors: 'Time up: fromDate is in the past',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('assessmentQuestionReport', () => {
    it('should successfully return assessment with questions when assessment is found', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const assessmentData = {
        _id: assessmentId,
        title: 'Sample Assessment',
        questions: [
          { _id: '6666c830eb18953046b1b56b', text: 'Sample Question' },
        ],
      };

      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(assessmentData),
        }),
      });

      await service.assessmentQuestionReport(assessmentId);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Assessment With Question Report!',
        assessmentData,
      );
    });

    it('should throw HttpException if assessment is not found', async () => {
      const assessmentId = 'nonexistent-assessment-id';

      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.assessmentQuestionReport(assessmentId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'Assessment not found',
            errors: 'Assessment not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
    });
  });

  describe('assessmentResultReport', () => {
    it('should return assessment results successfully when assessment is found and responses exist', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const assessmentData = {
        _id: assessmentId,
        title: 'Sample Assessment',
        questions: [
          { _id: '6666c830eb18953046b1b56b', text: 'Sample Question' },
        ],
      };

      const assessmentResponseData = [
        {
          _id: '6666c830eb18953046b1b56b',
          assessmentId: assessmentId,
          userId: '6666c830eb18953046b1b56b',
          history: [
            { questionId: '6666c830eb18953046b1b56b', response: 'A', score: 1 },
            { questionId: '6666c830eb18953046b1b56b', response: 'B', score: 2 },
          ],
        },
      ];

      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(assessmentData),
        }),
      });
      mockAssessmentResponseModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(assessmentResponseData),
      });

      const result = await service.assessmentResultReport(assessmentId);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentResponseModel.find).toHaveBeenCalledWith({
        assessmentId: new mongoose.Types.ObjectId(assessmentId),
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment With Question Report!',
        data: assessmentResponseData,
      });
    });

    it('should throw HttpException if assessment is not found', async () => {
      const assessmentId = 'nonexistent-assessment-id';

      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.assessmentResultReport(assessmentId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'Assessment not found',
            errors: 'Assessment not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
    });

    it('should return an empty result when no responses are found for the given assessment', async () => {
      const assessmentId = '6666c830eb18953046b1b56b';
      const assessmentData = {
        _id: assessmentId,
        title: 'Sample Assessment',
        questions: [
          { _id: '6666c830eb18953046b1b56b', text: 'Sample Question' },
        ],
      };

      mockAssessmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(assessmentData),
        }),
      });
      mockAssessmentResponseModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await service.assessmentResultReport(assessmentId);

      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockAssessmentResponseModel.find).toHaveBeenCalledWith({
        assessmentId: new mongoose.Types.ObjectId(assessmentId),
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment With Question Report!',
        data: [],
      });
    });
  });
});
