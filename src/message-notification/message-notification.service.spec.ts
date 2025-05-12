import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { MessageNotificationService } from './message-notification.service';
dotenv.config();
jest.mock('axios');
const mockMessageNotificationModel = {
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
  insertMany: jest.fn(),
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

  sendError: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('MessageNotificationService', () => {
  let service: MessageNotificationService;

  beforeEach(async () => {
    mockMessageNotificationModel.insertMany.mockResolvedValue([
      {
        _id: '1',
        userName: 'John Doe',
        phoneNo: '1234567890',
        message: 'Test message',
      },
      {
        _id: '2',
        userName: 'Jane Smith',
        phoneNo: '0987654321',
        message: 'Test message',
      },
    ]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageNotificationService,
        {
          provide: getModelToken('MessageNotification'),
          useValue: mockMessageNotificationModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<MessageNotificationService>(
      MessageNotificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should process CSV file, insert records, and send notifications', async () => {
      const mockSendingNotification = jest.fn().mockResolvedValue(undefined);
      service['sendingNotification'] = mockSendingNotification;

      const dto = { message: 'Test message' };

      const mockFile = {
        buffer: Buffer.from(
          'user_name,phone_no\nJohn Doe,1234567890\nJane Smith,0987654321',
        ),
      };

      const result = await service.create([mockFile], dto);

      expect(mockMessageNotificationModel.insertMany).toHaveBeenCalledWith([
        {
          userName: 'John Doe',
          phoneNo: '1234567890',
          message: 'Test message',
        },
        {
          userName: 'Jane Smith',
          phoneNo: '0987654321',
          message: 'Test message',
        },
      ]);
      expect(mockSendingNotification).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userName: 'John Doe' }),
        ]),
        'Test message',
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Notifications are send Successfully!!',
        data: [
          {
            _id: '1',
            userName: 'John Doe',
            phoneNo: '1234567890',
            message: 'Test message',
          },
          {
            _id: '2',
            userName: 'Jane Smith',
            phoneNo: '0987654321',
            message: 'Test message',
          },
        ], // This is a Promise from your service method
      });
    });

    it('should return error when file is missing or invalid', async () => {
      const result = await service.create([], { message: 'Test' });
      expect(mockBaseResponse.sendError).toHaveBeenCalledWith(
        400,
        'Uploaded file is missing or invalid',
        [],
      );
      expect(result).toEqual({
        statusCode: 400,
        message: 'Uploaded file is missing or invalid',
        data: [],
      });
    });
  });

  describe('findAll', () => {
    it('should return blocks with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockBlocks = [{ name: 'Block 1' }, { name: 'Block 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlocks),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockMessageNotificationModel.find.mockReturnValue(mockQuery);
      mockMessageNotificationModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockBlocks,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockMessageNotificationModel.find).toHaveBeenCalled();
      expect(mockMessageNotificationModel.countDocuments).toHaveBeenCalledWith(
        {},
      );
    });
  });

  describe('sendingNotification', () => {
    it('should send SMS notifications successfully', async () => {
      // Mock the axios post method to resolve with a successful response
      const mockResponse = {
        data: { success: true, message: 'SMS sent successfully' },
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse); // Ensure we cast to jest.Mock for proper typing

      const records = [{ phoneNo: '1234567890' }, { phoneNo: '0987654321' }];
      const message = 'Test message';

      // Call the method
      const result = await service.sendingNotification(records, message);

      const expectedPayload = new URLSearchParams({
        apiKey: process.env.SMS_API_KEY_PROMOTION,
        numbers: '911234567890,910987654321',
        message: 'Test message',
        sender: '617548',
      }).toString();

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.textlocal.in/send/?',
        expectedPayload,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': expect.any(Number),
          },
        }),
      );

      // Check that the response matches the expected result
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when SMS API call fails', async () => {
      // 👇 Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Failed to send SMS');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      const records = [{ phoneNo: '1234567890' }, { phoneNo: '0987654321' }];
      const message = 'Test message';

      await expect(
        service.sendingNotification(records, message),
      ).rejects.toThrow('Failed to send SMS');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send SMS: Failed to send SMS',
      );

      // 👇 Restore console after test
      consoleErrorSpy.mockRestore();
    });
  });
});
