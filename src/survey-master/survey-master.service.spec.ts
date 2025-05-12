import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { SurveyMasterService } from './survey-master.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));
const mockSurveyMasterModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Survey master' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Survey master' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockSubscriberModel = {
  findById: jest.fn(),
  find: jest.fn(),
};

const mockSurveyHistoryModel = {
  findById: jest.fn(),
  find: jest.fn(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockUserDeviceTokenModel = {
  findOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  select: jest
    .fn()
    .mockResolvedValue([
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ]),
};

const mockUserNotificationModel = {
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({
    _id: {
      toString: () => 'mockNotificationId',
    },
  }),
};

const mockFirebaseService = {
  getTranslatedFields: jest.fn(),
};

const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('SurveyMasterService', () => {
  let service: SurveyMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyMasterService,
        {
          provide: getModelToken('SurveyMaster'),
          useValue: mockSurveyMasterModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('SurveyHistory'),
          useValue: mockSurveyHistoryModel,
        },
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        { provide: FirebaseService, useValue: mockFirebaseService },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<SurveyMasterService>(SurveyMasterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Survey Master Algorithm', async () => {
      const createSurveyMasterDto = {
        id: 1,
        title: { en: 'Survey Master Algorithm' },
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllState: false,
        districtId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllDistrict: false,
        blockId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllBlock: false,
        healthFacilityId: [
          new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ],
        isAllHealthFacility: false,
        cadreId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllCadre: false,
        cadreType: ['State_Level'],
        questions: [
          {
            title: { en: 'Questions' },
            type: 'Type',
            option1: { en: 'option1' },
            option2: { en: 'option2' },
            option3: { en: 'option3' },
            option4: { en: 'option4' },
            active: false,
            orderIndex: 1,
          },
        ],
        sendInitialNotification: false,
        activated: true,
      };
      const mockSurveyMaster = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createSurveyMasterDto,
      };
      mockSurveyMasterModel.create.mockResolvedValue(mockSurveyMaster);

      const result = await service.create(createSurveyMasterDto);
      console.log('result--->', result);
      expect(mockSurveyMasterModel.create).toHaveBeenCalledWith(
        createSurveyMasterDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey Created successfully',
        data: mockSurveyMaster,
      });
    });
  });

  describe('getSurvey', () => {
    const mockUserId = '507f191e810c19729de860ea';
    const mockSubscriber = { _id: mockUserId, name: 'John Doe' };
    const mockSurveyMasters = [
      { _id: 'survey1', title: 'Survey 1' },
      { _id: 'survey2', title: 'Survey 2' },
    ];
    const filteredSurveys = [mockSurveyMasters[0]]; // Assume 1 completed, 1 left
    const mockDoneSurveyList = [
      {
        _id: 'history1',
        userId: mockUserId,
        surveyId: { _id: 'survey2', title: 'Survey 2' },
      },
    ];

    it('should return surveyList and doneSurveyList if subscriber exists', async () => {
      // Mock DB calls
      mockSubscriberModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSubscriber),
      });

      const mockBaseQuery = { userType: 'subscriber' }; // your logic in buildAssessmentQuery
      const mockBuildAssessmentQuery = jest
        .spyOn(service, 'buildAssessmentQuery' as any)
        .mockResolvedValue(mockBaseQuery);

      mockSurveyMasterModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSurveyMasters),
      });

      const mockFilterCompleted = jest
        .spyOn(service, 'filterCompletedSurveys' as any)
        .mockResolvedValue(filteredSurveys);

      mockSurveyHistoryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDoneSurveyList),
      });

      const result = await service.getSurvey(mockUserId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockBuildAssessmentQuery).toHaveBeenCalledWith(mockSubscriber);
      expect(mockSurveyMasterModel.find).toHaveBeenCalledWith(mockBaseQuery);
      expect(mockFilterCompleted).toHaveBeenCalledWith(
        mockSurveyMasters,
        new mongoose.Types.ObjectId(mockUserId),
      );
      expect(mockSurveyHistoryModel.find).toHaveBeenCalledWith({
        userId: new mongoose.Types.ObjectId(mockUserId),
      });

      expect(result).toEqual({
        message: 'Survey Details !',
        statusCode: 200,
        data: {
          surveyList: filteredSurveys,
          doneSurveyList: mockDoneSurveyList,
        },
      });
    });

    it('should throw 400 if subscriber not found', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getSurvey(mockUserId)).rejects.toThrowError(
        new HttpException(
          {
            message: 'Subscriber Not Found',
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should call filterService.filter and paginate with correct arguments', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = { some: 'query' };
      const mockSurveyMaster = [
        { name: 'Survey Master Algo 1' },
        { name: 'Survey Master Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockSurveyMaster);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockSurveyMasterModel,
        paginationDto,
        [],
        mockQuery,
      );
      expect(result).toEqual(mockSurveyMaster);
    });
  });

  describe('findOne', () => {
    it('should return a Survey Master by ID', async () => {
      const mockSurveyMaster = { _id: '1', title: 'Test Survey' };
      mockSurveyMasterModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSurveyMaster),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey fetch successfully',
        data: mockSurveyMaster,
      });
      expect(mockSurveyMasterModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Survey Master not found', async () => {
      mockSurveyMasterModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey fetch successfully',
        data: null,
      });
    });
  });

  describe('findAllSurvey', () => {
    it('Should Return all Active Surveys', async () => {
      const mockSurveyMaster = [
        { name: 'Survey Master Algo 1' },
        { name: 'Survey Master Algo 2' },
      ];
      mockSurveyMasterModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSurveyMaster),
        }),
      });
      const result = await service.findAllSurvey();

      expect(mockSurveyMasterModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Survey fetch successfully',
        data: mockSurveyMaster,
      });
    });
  });

  describe('update', () => {
    const mockSurveyId = '507f191e810c19729de860ea';
    const mockUpdateDto = {
      countryId: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
      stateId: [new mongoose.Types.ObjectId('507f191e810c19729de860ec')],
      districtId: [new mongoose.Types.ObjectId('507f191e810c19729de860ed')],
      cadreId: [new mongoose.Types.ObjectId('507f191e810c19729de860ee')],
      blockId: [new mongoose.Types.ObjectId('507f191e810c19729de860ef')],
      healthFacilityId: [
        new mongoose.Types.ObjectId('507f191e810c19729de860f0'),
      ],
    };
    it("should throw error if survey has associated history and can't be updated", async () => {
      mockSurveyHistoryModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(1),
      });

      await expect(
        service.update(mockSurveyId, mockUpdateDto),
      ).rejects.toThrowError(
        new HttpException(
          {
            message: "Survey can't Update!",
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockSurveyHistoryModel.find).toHaveBeenCalledWith({
        surveyId: mockSurveyId,
      });
    });

    it('should update the survey if no associated history exists', async () => {
      mockSurveyHistoryModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0),
      });

      const updatedDoc = { ...mockUpdateDto, _id: mockSurveyId };
      mockSurveyMasterModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.update(mockSurveyId, { ...mockUpdateDto });

      expect(mockSurveyHistoryModel.find).toHaveBeenCalledWith({
        surveyId: mockSurveyId,
      });

      expect(mockSurveyMasterModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSurveyId,
        {
          countryId: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
          stateId: [new mongoose.Types.ObjectId('507f191e810c19729de860ec')],
          districtId: [new mongoose.Types.ObjectId('507f191e810c19729de860ed')],
          cadreId: [new mongoose.Types.ObjectId('507f191e810c19729de860ee')],
          blockId: [new mongoose.Types.ObjectId('507f191e810c19729de860ef')],
          healthFacilityId: [
            new mongoose.Types.ObjectId('507f191e810c19729de860f0'),
          ],
        },
        { new: true },
      );

      expect(result).toEqual({
        message: 'Survey updated successfully',
        statusCode: 200,
        data: updatedDoc,
      });
    });
  });

  describe('remove', () => {
    const mockSurveyId = '507f191e810c19729de860ea';
    it("should throw error if survey has associated history and can't be deleted", async () => {
      mockSurveyHistoryModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(1),
      });

      await expect(service.remove(mockSurveyId)).rejects.toThrowError(
        new HttpException(
          {
            message: "Survey can't Delete!",
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockSurveyHistoryModel.find).toHaveBeenCalledWith({
        surveyId: mockSurveyId,
      });
    });
    it('should update the survey if no associated history exists', async () => {
      mockSurveyHistoryModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0),
      });

      mockSurveyMasterModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.remove(mockSurveyId);

      expect(mockSurveyHistoryModel.find).toHaveBeenCalledWith({
        surveyId: mockSurveyId,
      });

      expect(mockSurveyMasterModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockSurveyId,
      );

      expect(result).toEqual({
        message: 'Survey deleted successfully',
        statusCode: 200,
        data: [],
      });
    });
  });

  describe('sendInitialInvitation', () => {
    const surveyId = '607f1f77bcf86cd799439011';
    const adminUserId = '507f1f77bcf86cd799439011';
    const mockSurvey = {
      _id: surveyId,
      title: { en: 'Mock Survey Title' },
    };
    const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
    const mockDeviceTokens = [
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ];

    it('should queue a notification if device tokens are found', async () => {
      // Mock: find survey
      mockSurveyMasterModel.findById.mockResolvedValue(mockSurvey);

      // Mock: buildQuery
      jest.spyOn(service, 'buildQuery').mockResolvedValue({ some: 'query' });

      // Mock: find subscribers
      mockSubscriberModel.find.mockResolvedValue(mockUsers);

      // Mock: find device tokens
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDeviceTokens),
      });

      const result = await service.sendInitialInvitation(surveyId, adminUserId);

      expect(mockSurveyMasterModel.findById).toHaveBeenCalledWith(surveyId);
      expect(mockSubscriberModel.find).toHaveBeenCalledWith({ some: 'query' });
      expect(mockUserDeviceTokenModel.find).toHaveBeenCalledWith({
        userId: { $in: ['user1', 'user2'] },
      });
      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        'mockNotificationId',
        expect.any(Object),
        mockDeviceTokens,
        'survey',
      );

      expect(result).toEqual({
        message: 'Notifications are in Queue!!',
        statusCode: 200,
        data: [],
      });
    });

    it('should update survey if no device tokens are found', async () => {
      mockSurveyMasterModel.findById.mockResolvedValue(mockSurvey);
      jest.spyOn(service, 'buildQuery').mockResolvedValue({ some: 'query' });
      mockSubscriberModel.find.mockResolvedValue(mockUsers);
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await service.sendInitialInvitation(surveyId, adminUserId);

      expect(mockSurveyMasterModel.findByIdAndUpdate).toHaveBeenCalledWith(
        surveyId,
        { sendInitialNotification: true },
        { new: true },
      );
    });
  });
});
