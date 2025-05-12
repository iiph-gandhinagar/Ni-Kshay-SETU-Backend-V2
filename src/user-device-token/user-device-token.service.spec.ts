import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StoreDeviceTokenDTO } from 'src/subscriber/dto/store-device-token.dto';
import { UserDeviceTokenService } from './user-device-token.service';

const mockUserDeviceTokenModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test User Device Token' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated User Device Token' }),
  findOneAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated User Device Token' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  findOneAndDelete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn(),
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

const mockSubscriberModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
  findById: jest.fn().mockResolvedValue({
    populate: jest.fn().mockResolvedValue({}), // Mock `populate()` chain
  }),
  deleteOne: jest.fn(),
};

const mockChatConversionModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockFeedbackHistoryModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockKbaseUserHistoryModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockSubscriberActivityModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockSubscriberProgressHistoryModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockSurveyHistoryModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockUserAppVersionModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockUserNotificationModel = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
};

const mockDeleteAccountCountModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockEmailService = {
  sendDeleteAccountDetail: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('UserDeviceTokenService', () => {
  let service: UserDeviceTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeviceTokenService,
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('ChatConversion'),
          useValue: mockChatConversionModel,
        },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        {
          provide: getModelToken('FeedbackHistory'),
          useValue: mockFeedbackHistoryModel,
        },
        {
          provide: getModelToken('KbaseUserHistory'),
          useValue: mockKbaseUserHistoryModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('SubscriberProgressHistory'),
          useValue: mockSubscriberProgressHistoryModel,
        },
        {
          provide: getModelToken('SurveyHistory'),
          useValue: mockSurveyHistoryModel,
        },
        {
          provide: getModelToken('UserAppVersion'),
          useValue: mockUserAppVersionModel,
        },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        {
          provide: getModelToken('DeleteAccountCount'),
          useValue: mockDeleteAccountCountModel,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<UserDeviceTokenService>(UserDeviceTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeUserDeviceToken', () => {
    it('should update device token if it already exists', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto: StoreDeviceTokenDTO = {
        deviceId: 'device123',
        notificationToken: 'token123',
      };

      const existingToken = { deviceId: 'device123' };

      mockUserDeviceTokenModel.findOne.mockResolvedValue(existingToken);

      const result = await service.storeUserDeviceToken(userId, dto);

      expect(mockUserDeviceTokenModel.findOne).toHaveBeenCalledWith({
        deviceId: dto.deviceId,
      });
      expect(mockUserDeviceTokenModel.updateOne).toHaveBeenCalledWith(
        { deviceId: dto.deviceId },
        {
          notificationToken: dto.notificationToken,
          userId: expect.any(Object),
        },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'User Device Token Created successfully',
        data: [],
      });
    });

    it('should create device token if it does not exist', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto: StoreDeviceTokenDTO = {
        deviceId: 'device123',
        notificationToken: 'token123',
      };

      mockUserDeviceTokenModel.findOne.mockResolvedValue(null);

      const result = await service.storeUserDeviceToken(userId, dto);

      expect(mockUserDeviceTokenModel.findOne).toHaveBeenCalledWith({
        deviceId: dto.deviceId,
      });
      expect(mockUserDeviceTokenModel.create).toHaveBeenCalledWith({
        deviceId: dto.deviceId,
        notificationToken: dto.notificationToken,
        userId: expect.any(Object),
        isActive: 1,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'User Device Token Created successfully',
        data: [],
      });
    });
  });

  describe('removeNotificationToken', () => {
    it('should remove the device token successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto = { deviceId: 'device123' };

      mockUserDeviceTokenModel.findOneAndDelete.mockResolvedValue({
        _id: 'abc123',
      });

      const result = await service.removeNotificationToken(userId, dto);

      expect(mockUserDeviceTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        userId,
        deviceId: dto.deviceId,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'User Device Token Deleted successfully',
        data: [],
      });
    });

    it('should throw an error if no token found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto = { deviceId: 'device123' };

      mockUserDeviceTokenModel.findOneAndDelete.mockResolvedValue(null);

      await expect(
        service.removeNotificationToken(userId, dto),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'No such device found for this user!',
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockUserDeviceTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        userId,
        deviceId: dto.deviceId,
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and send email', async () => {
      const mockSubscriber = {
        _id: '507f191e810c19729de860ea',
        populate: jest.fn().mockResolvedValue({
          name: 'Test User',
          email: 'test@example.com',
        }),
      };

      mockAssessmentResponseModel.deleteMany.mockResolvedValue({});
      mockChatConversionModel.deleteMany.mockResolvedValue({});
      mockFeedbackHistoryModel.deleteMany.mockResolvedValue({});
      mockKbaseUserHistoryModel.deleteMany.mockResolvedValue({});
      mockSubscriberActivityModel.deleteMany.mockResolvedValue({});
      mockSubscriberProgressHistoryModel.deleteMany.mockResolvedValue({});
      mockSurveyHistoryModel.deleteMany.mockResolvedValue({});
      mockUserAppVersionModel.deleteMany.mockResolvedValue({});
      mockUserDeviceTokenModel.deleteMany.mockResolvedValue({});
      mockUserNotificationModel.deleteMany.mockResolvedValue({});
      mockSubscriberModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSubscriber),
      });
      mockDeleteAccountCountModel.findOneAndUpdate.mockResolvedValue({});
      mockSubscriberModel.deleteOne.mockResolvedValue({});
      mockEmailService.sendDeleteAccountDetail.mockResolvedValue({});
      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Account Deleted successfully!!',
        data: [],
      });

      const result = await service.deleteAccount(
        '507f191e810c19729de860ea',
        'No longer needed',
      );

      expect(mockAssessmentResponseModel.deleteMany).toHaveBeenCalled();
      expect(mockChatConversionModel.deleteMany).toHaveBeenCalled();
      expect(mockFeedbackHistoryModel.deleteMany).toHaveBeenCalled();
      expect(mockKbaseUserHistoryModel.deleteMany).toHaveBeenCalled();
      expect(mockSubscriberActivityModel.deleteMany).toHaveBeenCalled();
      expect(mockSubscriberProgressHistoryModel.deleteMany).toHaveBeenCalled();
      expect(mockSurveyHistoryModel.deleteMany).toHaveBeenCalled();
      expect(mockUserAppVersionModel.deleteMany).toHaveBeenCalled();
      expect(mockUserDeviceTokenModel.deleteMany).toHaveBeenCalled();
      expect(mockUserNotificationModel.deleteMany).toHaveBeenCalled();
      expect(mockSubscriberModel.findById).toHaveBeenCalled();
      expect(mockDeleteAccountCountModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockSubscriberModel.deleteOne).toHaveBeenCalled();
      expect(mockEmailService.sendDeleteAccountDetail).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Account Deleted successfully!!',
        data: [],
      });
    });

    it('should throw error if deletion fails', async () => {
      // Simulate an error in one of the delete operations
      mockSubscriberActivityModel.deleteMany.mockRejectedValueOnce(
        new Error('Delete error'),
      );

      await expect(
        service.deleteAccount('507f191e810c19729de860ea', 'Test reason'),
      ).rejects.toMatchObject({
        response: {
          message: 'Error processing Delete account:',
          errors: 'Bad Request',
        },
        status: 400,
      });
    });
  });
});
