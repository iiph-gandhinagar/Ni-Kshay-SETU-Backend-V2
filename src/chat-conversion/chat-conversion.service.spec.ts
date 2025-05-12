import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { ChatConversionAggregation } from '../common/pagination/chatConversionAggregation.service';
import { paginate } from '../common/pagination/pagination.service';
import { ChatConversionService } from './chat-conversion.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockChatConversionModel = {
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
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
  aggregate: jest.fn().mockReturnThis(),
};

jest.mock('../common/pagination/chatConversionAggregation.service', () => ({
  ChatConversionAggregation: jest.fn(),
}));

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockAdminModel = {
  findById: jest.fn().mockResolvedValue([]),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('ChatConversionService', () => {
  let service: ChatConversionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatConversionService,
        {
          provide: getModelToken('ChatConversion'),
          useValue: mockChatConversionModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<ChatConversionService>(ChatConversionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a Chat Conversion', async () => {
      const mockChatConversion = { _id: '1', sessionId: 'Testquestion123' };
      mockChatConversionModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockChatConversion),
      });

      const result = await service.findOne('question', 'value');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion history fetch successfully',
        data: mockChatConversion,
      });
      expect(mockChatConversionModel.findOne).toHaveBeenCalledWith({
        ['question']: 'value',
      });
    });

    it('should return null if Chat Conversion not found', async () => {
      mockChatConversionModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      const result = await service.findOne('test', 'value');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion history fetch successfully',
        data: null,
      });
    });
  });

  describe('findById', () => {
    it('Should Return a Chat Conversion By Id', async () => {
      const mockChatConversion = { _id: '1', sessionId: 'abc3455' };
      mockChatConversionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockChatConversion),
      });

      const result = await service.findById('abc3455');

      expect(mockChatConversionModel.findOne).toHaveBeenCalledWith({
        sessionId: 'abc3455',
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion history fetch successfully',
        data: mockChatConversion,
      });
    });
  });

  describe('chatHistoriesForAdmin', () => {
    it('should return Chat Conversion History with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockChatConversion = [
        { sessionId: 'ChatConversion1' },
        { sessionId: 'ChatConversion2' },
      ];
      const mockAdminUser = {
        _id: userId,
        state: 'state123',
        district: 'district123',
        isAllState: false,
        isAllDistrict: false,
      };

      mockAdminModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue({});
      (ChatConversionAggregation as jest.Mock).mockResolvedValue(
        mockChatConversion,
      );

      const result = await service.chatHistoriesForAdmin(paginationDto, userId);

      expect(mockAdminModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(ChatConversionAggregation).toHaveBeenCalledWith(
        mockChatConversionModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockChatConversion);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto = { limit: 10, page: 1, fromDate: '', toDate: '' };

      mockAdminModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null), // Simulating no user found
      });

      await expect(
        service.chatHistoriesForAdmin(paginationDto, userId),
      ).rejects.toThrowError(
        new HttpException('Admin User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockAdminModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('chatHistoryCsv', () => {
    it('should return Chat Conversion result data', async () => {
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
      mockAdminModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(mockAdminUser),
      });

      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockChatConversionModel.exec.mockResolvedValue(mockAggregatedData);

      const result = await service.chatHistoryCsv(
        mockPaginationDto,
        '6666c830eb18953046b1b56b',
      );

      expect(mockAdminModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockFilterService.filter).toHaveBeenCalledWith({
        ...mockPaginationDto,
        adminStateId: 'state123',
        adminDistrictId: 'district123',
      });

      expect(mockChatConversionModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion history fetch successfully',
        data: mockAggregatedData,
      });
    });
  });

  describe('chatHistory', () => {
    const mockPaginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      fromDate: '',
      toDate: '',
    };
    const mockUserId = '64b7f3d7c8637a29f4e1a41c';
    const mockQuery = { some: 'query' };
    const mockUpdatedQuery = { some: 'query' };
    const mockResourceMaterial = [
      { title: 'Chat ConversionI Algo 1' },
      { title: 'Chat ConversionI Algo 2' },
    ];

    it('should return paginated Chat ConversionIs with population', async () => {
      // Mock filter
      mockFilterService.filter.mockResolvedValue(mockQuery);

      (paginate as jest.Mock).mockResolvedValue(mockResourceMaterial);

      const result = await service.chatHistory(mockPaginationDto, mockUserId);

      expect(mockFilterService.filter).toHaveBeenCalledWith(mockPaginationDto);

      expect(paginate).toHaveBeenCalledWith(
        mockChatConversionModel,
        mockPaginationDto,
        [
          {
            path: 'userId',
            select:
              'name phoneNo email cadreId countryId stateId districtId blockId healthFacilityId',
            populate: [
              { path: 'cadreId', select: 'title' },
              { path: 'countryId', select: 'title' },
              {
                path: 'stateId',
                select: 'title',
              },
              {
                path: 'districtId',
                select: 'title',
              },
              {
                path: 'blockId',
                select: 'title',
              },
              {
                path: 'healthFacilityId',
                select: 'healthFacilityCode',
              },
            ],
          },
        ],
        mockUpdatedQuery,
      );

      expect(result).toEqual(mockResourceMaterial);
    });
  });

  describe('storeChatHistory', () => {
    it('Should store chat history of a user', async () => {
      const createChatConversionDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'block',
      };
      const mockChatConversion = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createChatConversionDto,
      };
      mockChatConversionModel.create.mockResolvedValue(mockChatConversion);

      const result = await service.storeChatHistory(createChatConversionDto);
      expect(mockChatConversionModel.create).toHaveBeenCalledWith(
        createChatConversionDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion created Successfully',
        data: mockChatConversion,
      });
    });
  });

  describe('updateChatHistory', () => {
    it('Should update chat History', async () => {
      const updateChatConversionDto = {
        message: [
          {
            question: 'Hello world!',
            answer: 'abc',
            type: 'greetings',
            category: 'NTEP',
            platform: 'mobile',
            like: false,
          },
        ],
        timestamp: new Date().toISOString(),
      };

      mockChatConversionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updateChatConversionDto),
      });
      const result = await service.updateChatHistory(
        '6666c830eb18953046b1b56b',
        '6666c830eb18953046b1b56b',
        updateChatConversionDto,
      );

      expect(mockChatConversionModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
          sessionId: '6666c830eb18953046b1b56b',
        },
        {
          $push: {
            message: updateChatConversionDto,
          },
        },
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Chat Conversion updated successfully',
        data: {},
      });
    });
  });

  describe('findLastQuestionForInsert', () => {
    const mockMessages = [
      {
        text: 'Q1',
        category: 'OTHER',
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        text: 'Q2',
        category: 'NTEP',
        createdAt: new Date('2024-01-01T11:00:00Z'),
      },
      {
        text: 'Q3',
        category: 'NTEP',
        createdAt: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    it('should return the most recent NTEP message', async () => {
      mockChatConversionModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          message: mockMessages,
          userId: '507f191e810c19729de860ea',
          sessionId: 'sess123',
        }),
      });

      const result = await service.findLastQuestionForInsert(
        '507f191e810c19729de860ea',
      );
      expect(result).toEqual(mockMessages[2]); // Latest NTEP message
    });

    it('should return null if no NTEP messages exist', async () => {
      const nonNTEPMessages = mockMessages.map((msg) => ({
        ...msg,
        category: 'GENERAL',
      }));

      mockChatConversionModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          message: nonNTEPMessages,
          userId: '',
          sessionId: 'sess123',
        }),
      });

      const result = await service.findLastQuestionForInsert(
        '507f191e810c19729de860ea',
      );
      expect(result).toBeNull();
    });

    it('should return undefined if no chat conversion exists', async () => {
      mockChatConversionModel.findOne().exec.mockResolvedValue(null);

      const result = await service.findLastQuestionForInsert(
        '507f191e810c19729de860ea',
      );
      expect(result).toBeUndefined();
    });
  });
});
