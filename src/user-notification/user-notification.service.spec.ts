import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { UserNotificationService } from './user-notification.service';
jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));
const mockUserNotificationModel = {
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

const mockFirebaseService = {
  getTranslatedFields: jest.fn(),
};

const mockDiagnosisModel = {
  findById: jest.fn(),
};

const mockQuery = {
  where: jest.fn().mockReturnThis(),
  equals: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{ _id: 'sub123' }]),
};

const mockSubscriberModel = {
  find: jest.fn().mockReturnValue(mockQuery),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
const mockDifferentialCareModel = {
  findById: jest.fn(),
};

const mockGuidanceOnAdrModel = {
  findById: jest.fn(),
};

const mockTreatmentModel = {
  findById: jest.fn(),
};

const mockLatentTbModel = {
  findById: jest.fn(),
};

const mockResourceMaterialModel = {
  findById: jest.fn(),
};

const mockAssessmentModel = {
  findById: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({
    title: { en: 'Test Assessment' },
    timeToComplete: '20',
  }),
};
const mockAdminUserModel = {
  findById: (id: string) => ({
    populate: () => ({
      select: () => ({
        lean: () =>
          Promise.resolve({
            _id: id,
            role: { name: 'Manager' },
          }),
      }),
    }),
  }),
};
const mockUserDeviceTokenModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue([]), // or return dummy tokens if needed
  }),
};
const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn(),
};
describe('UserNotificationService', () => {
  let service: UserNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationService,
        {
          provide: getModelToken('AlgorithmDiagnosis'),
          useValue: mockDiagnosisModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        {
          provide: getModelToken('AlgorithmDifferentialCare'),
          useValue: mockDifferentialCareModel,
        },
        {
          provide: getModelToken('AlgorithmGuidanceOnAdverseDrugReaction'),
          useValue: mockGuidanceOnAdrModel,
        },
        {
          provide: getModelToken('AlgorithmTreatment'),
          useValue: mockTreatmentModel,
        },
        {
          provide: getModelToken('AlgorithmLatentTbInfection'),
          useValue: mockLatentTbModel,
        },
        {
          provide: getModelToken('ResourceMaterial'),
          useValue: mockResourceMaterialModel,
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

    service = module.get<UserNotificationService>(UserNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user notification and return the result', async () => {
      const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
      const AdminUserId = '507f1f77bcf86cd799439014';

      const createUserNotificationDto: any = {
        type: 'multiple-filters',
        countryId: '507f1f77bcf86cd799439011',
        stateId: ['507f1f77bcf86cd799439012'],
        isAllState: false,
        cadreId: ['507f1f77bcf86cd799439013'],
        isAllCadre: false,
        districtId: ['507f1f77bcf86cd799439014'],
        isAllDistrict: false,
        cadreType: 'State_Level',
        typeTitle: {
          title: 'Test Assessment',
        },
        createdBy: '507f1f77bcf86cd799439014',
        automaticNotificationType: 'Assessment',
        userId: ['507f1f77bcf86cd799439014'],
        isAllUser: false,
        title: 'User Notification',
        description: 'User Notification',
        isDeepLink: true,
        successfulCount: 0,
        failedCount: 0,
        status: 'Pending',
        link: 'link',
        assessmentTitle: 'Test Assessment',
        timeToCompleted: '20',
      };
      const assessmentId = new mongoose.Types.ObjectId(
        '507f1f77bcf86cd799439015',
      );
      createUserNotificationDto.typeTitle._id = assessmentId;
      // Mock subscriberModel.find().exec()
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        equals: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest
          .fn()
          .mockResolvedValue([
            { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014') },
          ]),
      };
      mockSubscriberModel.find = jest.fn().mockReturnValue(mockQuery);

      // Mock assessmentModel.findById()
      mockAssessmentModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          title: { en: 'Test Assessment' },
          timeToComplete: '20',
        }),
      });

      // Mock userNotificationModel.create()
      mockUserNotificationModel.create = jest.fn().mockResolvedValue({
        _id: mockId,
        link: 'http://testlink.com',
      });

      // Mock userDeviceTokenModel.find()
      mockUserDeviceTokenModel.find = jest.fn().mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue([
            { notificationToken: 'token1' },
            { notificationToken: 'token2' },
          ]),
      });

      // Mock notificationQueueService
      mockNotificationQueueService.addNotificationToQueue = jest.fn();

      // Run service
      const result = await service.create(
        createUserNotificationDto,
        AdminUserId,
      );

      expect(mockSubscriberModel.find).toHaveBeenCalled();
      expect(mockAssessmentModel.findById).toHaveBeenCalledWith(assessmentId);
      expect(mockUserNotificationModel.create).toHaveBeenCalled();
      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'User Notification Created successfully',
        data: {
          _id: mockId,
          link: 'http://testlink.com',
        },
      });
    });
  });
  describe('findAll', () => {
    const mockUserId = '6666c830eb18953046b1b56b';
    it('should return Admin User with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockUserNotification = [{ _id: '1', title: 'User Notification' }];
      const mockQuery = { active: true };

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockUserNotification);

      const result = await service.findAll(paginationDto, mockUserId);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockUserNotificationModel,
        paginationDto,
        [
          { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
          { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
          { path: 'cadreId', select: 'title' }, // Populate cadreId and select only the name field
          { path: 'districtId', select: 'title' }, // Populate DistrictId and select only the name field
          { path: 'createdBy', select: 'firstName lastName email' }, // Populate createdBy and select only the name field
          { path: 'userId', select: 'name phoneNo email' },
        ], // populate options
        mockQuery,
      );
      expect(result).toEqual(mockUserNotification);
    });
  });
  describe('findOne', () => {
    const mockNotificationId = '507f1f77bcf86cd799439011';
    const mockNotification = {
      _id: mockNotificationId,
      title: 'Sample Notification',
      countryId: { title: 'India' },
      stateId: { title: 'Maharashtra' },
      cadreId: { title: 'Health Worker' },
      districtId: { title: 'Pune' },
      createdBy: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
      },
      userId: {
        name: 'John Doe',
        phoneNo: '1234567890',
        email: 'john@example.com',
      },
    };

    it('should return user notification by ID', async () => {
      mockUserNotificationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotification),
        }),
      });

      const result = await service.findOne(mockNotificationId);

      expect(mockUserNotificationModel.findById).toHaveBeenCalledWith(
        mockNotificationId,
      );

      expect(result).toEqual({
        message: 'User Notification fetch successfully',
        statusCode: 200,
        data: mockNotification,
      });
    });
  });
  describe('updateOne', () => {
    it('should update and return the updated User Notification', async () => {
      const updatedUserNotification = {
        _id: '1',
        title: 'Updated User Notification',
      };
      mockUserNotificationModel.findByIdAndUpdate.mockResolvedValue(
        updatedUserNotification,
      );

      const result = await service.updateOne('1', {
        title: 'Updated User Notification',
      });

      expect(result).toEqual(updatedUserNotification);
      expect(mockUserNotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated User Notification' },
      );
    });
  });
  describe('getUserNotification', () => {
    const mockUserId = '507f191e810c19729de860ea';
    it('should return paginated user notifications using $or query', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = { some: 'query' };
      const mockUserNotification = [
        { Title: 'User Notification Algo 1' },
        { Title: 'User Notification Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockUserNotification);

      const result = await service.getUserNotification(
        paginationDto,
        mockUserId,
      );

      expect(paginate).toHaveBeenCalledWith(
        mockUserNotificationModel,
        paginationDto,
        [],
        {
          $or: [
            { userId: { $in: [new mongoose.Types.ObjectId(mockUserId)] } },
            { isAllUser: true },
          ],
        },
      );

      expect(result).toEqual(mockUserNotification);
    });
  });
});
