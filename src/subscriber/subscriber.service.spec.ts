import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { SubscriberProgressService } from 'src/subscriber-progress/subscriber-progress.service';
import { SubscriberAggregation } from '../common/pagination/subscriberAggregation.service';
import { CreateSubscriberV2Dto } from './dto/create-subscriber-v2.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SubscriberService } from './subscriber.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
};
jest.mock('axios');

jest.mock('../common/pagination/subscriberAggregation.service', () => ({
  SubscriberAggregation: jest.fn(),
}));

const mockSubscriberModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Block' }),
  updateOne: jest.fn().mockResolvedValue({}),
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

const mockEmailService = {
  sendOTP: jest.fn().mockReturnValue({}),
};

const mockSubscriberProgressService = {
  getOverallAchievement: jest.fn().mockReturnValue({}),
};

const mockLeaderBoardService = {
  getOverallAchievement: jest.fn().mockReturnValue({}),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockInstituteModel = {
  findOne: jest.fn(),
};

const mockSubscriberActivityModel = {
  findOne: jest.fn(),
};

const mockSubscriberProgressHistoryModel = {
  findOne: jest.fn(),
};

const mockLeaderBoardTaskModel = {
  findOne: jest.fn(),
};

const mockLeaderBoardLevelModel = {
  findOne: jest.fn(),
};

const mockLeaderBoardBadgeModel = {
  findOne: jest.fn(),
};

const mockStateModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockCountryModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockDistrictModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockBlockModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockHealthFacilityModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockCadreModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
  sendError: jest.fn().mockImplementation((statusCode, errorMessage, data) => ({
    statusCode,
    errorMessage,
    data,
  })),
};
describe('SubscriberService', () => {
  let service: SubscriberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberService,
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: getModelToken('Institute'), useValue: mockInstituteModel },
        {
          provide: getModelToken('subscriberProgressHistory'),
          useValue: mockSubscriberProgressHistoryModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('leaderBoardTask'),
          useValue: mockLeaderBoardTaskModel,
        },
        {
          provide: getModelToken('leaderBoardLevel'),
          useValue: mockLeaderBoardLevelModel,
        },
        {
          provide: getModelToken('leaderBoardBadge'),
          useValue: mockLeaderBoardBadgeModel,
        },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        {
          provide: getModelToken('HealthFacility'),
          useValue: mockHealthFacilityModel,
        },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: EmailService, useValue: mockEmailService },
        {
          provide: SubscriberProgressService,
          useValue: mockSubscriberProgressService,
        },
        { provide: LeaderBoardService, useValue: mockLeaderBoardService },
      ],
    }).compile();

    service = module.get<SubscriberService>(SubscriberService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a subscriber', async () => {
      const createSubscriberDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'block',
        name: 'John Doe',
        email: 'johnDoe@gmail.com',
        phoneNo: '1234567890',
        countryCode: '+1',
        password: 'password123',
        cadreType: 'cadre',
        isVerified: true,
        cadreId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        blockId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        healthFacilityId: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ),
        isOldUser: false,
        isActive: true,
        userContext: {
          chatHotQuestionOffset: 0,
          weeklyAssessmentCount: 0,
          feedbackHistory: [
            {
              feedbackId: '12345',
              feedbackType: 'general',
            },
          ],
          queryDetails: {
            queryId: '12345',
            queryType: 'general',
          },
        },
        status: 'active',
      };
      const mockSubscriber = {
        _id: '6666c830eb18953046b1b56b',
        ...createSubscriberDto,
      };
      mockSubscriberModel.create.mockResolvedValue(mockSubscriber);

      const result = await service.create(createSubscriberDto);
      expect(mockSubscriberModel.create).toHaveBeenCalledWith(
        createSubscriberDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber created successfully',
        data: mockSubscriber,
      });
    });
  });

  describe('createV2', () => {
    it('should create a new subscriber V2 with ObjectId fields and return success response', async () => {
      const createSubscriberV2Dto: CreateSubscriberV2Dto = {
        name: 'Test User V2',
        phoneNo: '9876543210',
        countryCode: '+91',
        countryId: '6608f5f8c96c2f0a2c42efb2',
        cadreId: '6608f5f8c96c2f0a2c42efb3',
        stateId: '6608f5f8c96c2f0a2c42efb4',
        districtId: '6608f5f8c96c2f0a2c42efb5',
        blockId: '6608f5f8c96c2f0a2c42efb6',
        healthFacilityId: '6608f5f8c96c2f0a2c42efb7',
        // any other necessary fields
      } as any;

      const savedSubscriber = {
        _id: 'someid456',
        ...createSubscriberV2Dto,
        countryId: new mongoose.Types.ObjectId('6608f5f8c96c2f0a2c42efb2'),
        cadreId: new mongoose.Types.ObjectId('6608f5f8c96c2f0a2c42efb3'),
        stateId: new mongoose.Types.ObjectId('6608f5f8c96c2f0a2c42efb4'),
        districtId: new mongoose.Types.ObjectId('6608f5f8c96c2f0a2c42efb5'),
        blockId: new mongoose.Types.ObjectId('6608f5f8c96c2f0a2c42efb6'),
        healthFacilityId: new mongoose.Types.ObjectId(
          '6608f5f8c96c2f0a2c42efb7',
        ),
        status: 'Unverified',
        userContext: {
          chatHotQuestionOffset: 0,
          weeklyAssessmentCount: 0,
          feedbackHistory: [],
          queryDetails: {},
        },
      };

      mockSubscriberModel.create.mockResolvedValue(savedSubscriber);

      const result = await service.createV2(createSubscriberV2Dto);

      // Check ObjectId conversion
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.countryId),
      ).toBeTruthy();
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.cadreId),
      ).toBeTruthy();
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.stateId),
      ).toBeTruthy();
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.districtId),
      ).toBeTruthy();
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.blockId),
      ).toBeTruthy();
      expect(
        mongoose.isValidObjectId(createSubscriberV2Dto.healthFacilityId),
      ).toBeTruthy();

      // Check that save was called
      expect(mockSubscriberModel.create).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: savedSubscriber,
      });
    });

    it('should create a subscriber V2 when optional ObjectId fields are missing', async () => {
      const createSubscriberV2Dto: CreateSubscriberV2Dto = {
        name: 'Minimal User V2',
        phoneNo: '1234567890',
        countryCode: '+1',
        // no countryId, cadreId, etc
      } as any;

      const savedSubscriber = {
        _id: 'someid789',
        ...createSubscriberV2Dto,
        status: 'Unverified',
        userContext: {
          chatHotQuestionOffset: 0,
          weeklyAssessmentCount: 0,
          feedbackHistory: [],
          queryDetails: {},
        },
      };

      mockSubscriberModel.create.mockResolvedValue(savedSubscriber);

      const result = await service.createV2(createSubscriberV2Dto);
      expect(mockSubscriberModel.create).toHaveBeenCalledWith(
        createSubscriberV2Dto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber created successfully',
        data: savedSubscriber,
      });
    });
  });

  describe('findAll', () => {
    it('should return Survey History with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockSubscriber = [
        { name: 'Subscriber 1' },
        { name: 'Subscriber 2' },
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
      (SubscriberAggregation as jest.Mock).mockResolvedValue(mockSubscriber);

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(SubscriberAggregation).toHaveBeenCalledWith(
        mockSubscriberModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSubscriber);
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

  describe('subscriberReport', () => {
    const mockAdminUser = {
      _id: '6666c830eb18953046b1b56b',
      isAllState: false,
      isAllDistrict: false,
      state: '6666c830eb18953046b1b56b',
      district: '6666c830eb18953046b1b56b',
    };

    const mockSubscriber = {
      _id: '6666c830eb18953046b1b56b',
      name: 'John Doe',
      phoneNo: '1234567890',
      isVerified: true,
      email: 'john@example.com',
      status: 'Unverified',
      isOldUser: false,
      countryId: '6666c830eb18953046b1b56b',
      stateId: '6666c830eb18953046b1b56b',
      districtId: '6666c830eb18953046b1b56b',
      blockId: '6666c830eb18953046b1b56b',
      healthFacilityId: '6666c830eb18953046b1b56b',
      cadreId: '6666c830eb18953046b1b56b',
      cadreType: 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function () {
        return { ...this };
      },
    };
    it('should return paginated enriched subscriber list', async () => {
      const paginationDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as any;

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });
      mockFilterService.filter.mockResolvedValue({}); // Simple filter

      mockSubscriberModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([mockSubscriber]),
      });

      mockCountryModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b', title: 'USA' },
      ]);
      mockStateModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b', title: 'California' },
      ]);
      mockDistrictModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b', title: 'Los Angeles' },
      ]);
      mockBlockModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b', title: 'Block 1' },
      ]);
      mockHealthFacilityModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b', healthFacilityCode: 'HF123' },
      ]);
      mockCadreModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            _id: '6666c830eb18953046b1b56b',
            title: 'Cadre A',
            cadreType: 'Primary',
            cadreGroup: { _id: '6666c830eb18953046b1b56b', title: 'Group A' },
          },
        ]),
      });

      mockSubscriberModel.countDocuments.mockResolvedValue(1);

      const result = await service.subscriberReport(
        paginationDto,
        '6666c830eb18953046b1b56b',
      );

      expect(result.status).toBe(true);
      expect(result.data.list).toHaveLength(1);
      expect(result.data.totalItems).toBe(1);
      expect(result.data.currentPage).toBe(1);
      expect(result.data.totalPages).toBe(1);

      expect(result.data.list[0]).toMatchObject({
        name: 'John Doe',
        country: 'USA',
        state: 'California',
        district: 'Los Angeles',
        block: 'Block 1',
        healthFacility: 'HF123',
        cadre: 'Cadre A',
        cadreGroup: 'Group A',
        cadreType: 'Primary',
      });
    });

    it('should apply adminStateId and adminDistrictId when admin does not have access to all states/districts', async () => {
      const paginationDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as any;

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });
      mockFilterService.filter.mockResolvedValue({});

      mockSubscriberModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      });

      mockSubscriberModel.countDocuments.mockResolvedValue(0);

      const result = await service.subscriberReport(
        paginationDto,
        '6666c830eb18953046b1b56b',
      );

      expect(paginationDto.adminStateId).toEqual('6666c830eb18953046b1b56b');
      expect(paginationDto.adminDistrictId).toEqual('6666c830eb18953046b1b56b');
      expect(result.data.list).toHaveLength(0);
    });

    it('should modify query if primaryCadres are provided', async () => {
      const paginationDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        primaryCadres: ['6666c830eb18953046b1b56b'],
      } as any;

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });
      mockFilterService.filter.mockResolvedValue({});

      mockCadreModel.find.mockReturnValue({
        distinct: jest
          .fn()
          .mockResolvedValue([
            '6666c830eb18953046b1b56b',
            '6666c830eb18953046b1b56b',
          ]),
      });

      mockSubscriberModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      });

      mockSubscriberModel.countDocuments.mockResolvedValue(0);

      const result = await service.subscriberReport(
        paginationDto,
        '6666c830eb18953046b1b56b',
      );

      expect(result.data.list).toHaveLength(0);
    });

    it('should return empty list when no subscribers found', async () => {
      const paginationDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as any;

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });
      mockFilterService.filter.mockResolvedValue({});

      mockSubscriberModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      });

      mockSubscriberModel.countDocuments.mockResolvedValue(0);

      const result = await service.subscriberReport(
        paginationDto,
        'adminUserId',
      );

      expect(result.data.list).toEqual([]);
      expect(result.data.totalItems).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return an array of subscribers', async () => {
      const mockSubscribers = [
        { _id: '1', name: 'Subscriber 1' },
        { _id: '2', name: 'Subscriber 2' },
      ];
      mockSubscriberModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscribers),
      });

      const result = await service.findOne('1');
      expect(mockSubscriberModel.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber fetch successfully',
        data: mockSubscribers,
      });
    });
  });
  describe('update', () => {
    it('should update a subscriber and return success response', async () => {
      const id = '609e125b5d1d2c23b8b4e761';
      const updateSubscriberDto = {
        stateId: new mongoose.Types.ObjectId('609e126c5d1d2c23b8b4e762'),
        districtId: new mongoose.Types.ObjectId('609e126c5d1d2c23b8b4e763'),
        blockId: new mongoose.Types.ObjectId('609e126c5d1d2c23b8b4e764'),
        healthFacilityId: new mongoose.Types.ObjectId(
          '609e126c5d1d2c23b8b4e765',
        ),
        countryId: new mongoose.Types.ObjectId('609e126c5d1d2c23b8b4e766'),
        someOtherField: 'example value',
      };

      const updatedSubscriber = {
        _id: id,
        ...updateSubscriberDto,
        status: 'Verified',
      };

      // Mock findByIdAndUpdate to return updated subscriber
      (mockSubscriberModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSubscriber),
      });
      const result = await service.update(id, {
        ...updateSubscriberDto,
        phoneNo: '',
      });

      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          stateId: expect.any(mongoose.Types.ObjectId),
          districtId: expect.any(mongoose.Types.ObjectId),
          blockId: expect.any(mongoose.Types.ObjectId),
          healthFacilityId: expect.any(mongoose.Types.ObjectId),
          countryId: expect.any(mongoose.Types.ObjectId),
          someOtherField: 'example value',
          status: 'Verified',
        }),
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber updated successfully',
        data: updatedSubscriber,
      });
    });

    it('should work when optional fields are missing', async () => {
      const id = '609e125b5d1d2c23b8b4e761';
      const updateSubscriberDto = {
        someOtherField: 'only this field updated',
      };

      const updatedSubscriber = {
        _id: id,
        ...updateSubscriberDto,
        status: 'Verified',
      };

      mockSubscriberModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSubscriber),
      });

      const result = await service.update(id, {
        ...updateSubscriberDto,
        phoneNo: '',
      });

      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          someOtherField: 'only this field updated',
          status: 'Verified',
        }),
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber updated successfully',
        data: updatedSubscriber,
      });
    });
  });

  describe('remove', () => {
    it('should delete a subscriber and return success message', async () => {
      const mockSubscriber = { _id: '1', name: 'Test Subscriber' };
      mockSubscriberModel.findByIdAndDelete.mockResolvedValue(mockSubscriber);

      const result = await service.remove('1');
      expect(mockSubscriberModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber deleted successfully',
        data: [],
      });
    });
  });

  describe('sendForgotOtp', () => {
    it('should send OTPs to users who are unverified and created 10 minutes ago', async () => {
      const mockUsers = [
        {
          phoneNo: '1234567890',
          email: 'user1@example.com',
          name: 'User One',
        },
        {
          phoneNo: '0987654321',
          email: 'user2@example.com',
          name: 'User Two',
        },
      ];

      // Mock the find query
      mockSubscriberModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      jest.spyOn(service, 'otpGeneration').mockResolvedValue({
        status: true,
        code: 200,
        message: 'OTP send Successfully',
        data: [],
      });
      // Mock findOneAndUpdate
      mockSubscriberModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const result = await service.sendForgotOtp();

      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        isVerified: false,
        createdAt: expect.any(Date),
      });

      expect(service.otpGeneration).toHaveBeenCalledTimes(mockUsers.length);

      mockUsers.forEach((user) => {
        expect(service.otpGeneration).toHaveBeenCalledWith({
          phoneNo: user.phoneNo,
          email: user.email,
        });

        expect(mockSubscriberModel.findOneAndUpdate).toHaveBeenCalledWith(
          { phoneNo: user.phoneNo },
          { forgotOtpTime: expect.any(Date) },
        );
      });

      expect(result).toBe(true);
    });

    it('should return true even if no users are found', async () => {
      mockSubscriberModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(undefined);
      const result = await service.sendForgotOtp();

      expect(service.otpGeneration).not.toHaveBeenCalled();
      expect(mockSubscriberModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('sendOtpManually', () => {
    it('should successfully send OTP and update forgotOtpTime', async () => {
      const mockUser = {
        _id: '6666c830eb18953046b1b56b',
        phoneNo: '1234567890',
        email: 'user@example.com',
      };

      // Mock the mockSubscriberModel's findById to return the mockUser
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock the otpGeneration function to resolve successfully
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(undefined);

      // Mock the findOneAndUpdate function to resolve successfully
      mockSubscriberModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      // Call the method
      const result = await service.sendOtpManually('6666c830eb18953046b1b56b');

      // Assert that otpGeneration was called with the correct payload
      expect(service.otpGeneration).toHaveBeenCalledWith({
        phoneNo: '1234567890',
        email: 'user@example.com',
      });

      // Assert that findOneAndUpdate was called to update forgotOtpTime
      expect(mockSubscriberModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '6666c830eb18953046b1b56b' },
        { forgotOtpTime: expect.any(Date) },
      );

      // Assert that the result is the expected response
      expect(result).toEqual({
        statusCode: 200,
        message: 'OTP send Successfully',
        data: [],
      });
    });
    it('should return error if user not found', async () => {
      // Mock findById to return null (user not found)
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Call the method
      await expect(
        service.sendOtpManually('nonExistentUserId'),
      ).rejects.toThrowError('User not found');
    });
    it('should handle OTP generation failure', async () => {
      const mockUser = {
        _id: 'someUserId',
        phoneNo: '1234567890',
        email: 'user@example.com',
      };

      // Mock findById to return the mockUser
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock otpGeneration to throw an error
      jest
        .spyOn(service, 'otpGeneration')
        .mockRejectedValue(new Error('OTP generation failed'));

      // Call the method
      await expect(service.sendOtpManually('someUserId')).rejects.toThrowError(
        'OTP generation failed',
      );
    });

    it('should not send OTP if phoneNo or email is missing', async () => {
      const mockUser = {
        _id: 'someUserId',
        phoneNo: '', // Missing phoneNo
        email: 'user@example.com',
      };

      // Mock findById to return the mockUser
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock otpGeneration to resolve successfully
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(undefined);

      // Mock findOneAndUpdate to resolve successfully
      mockSubscriberModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      // Call the method
      const result = await service.sendOtpManually('someUserId');

      // Assert that otpGeneration was not called
      expect(service.otpGeneration).not.toHaveBeenCalled();

      // Assert the response
      expect(result).toEqual({
        statusCode: 400,
        message: 'Phone number or email missing',
        data: [],
      });
    });
  });

  describe('otpGeneration', () => {
    it('should generate OTP for allowed IPs', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '9426426287',
        email: 'test@example.com',
      };
      const mockIp = '49.34.230.80'; // IP in the allowed list

      // Mock successful OTP response
      const response = {
        status: true,
        message: 'OTP sent successfully',
        data: [],
        code: 200,
      };

      // Mock external service calls
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(response);

      const result = await service.otpGeneration(mockOtpGenerationDto, mockIp);

      expect(result).toEqual(response);
      expect(service.otpGeneration).toHaveBeenCalledTimes(1);
    });
    it('should generate OTP for allowed phone numbers', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '9426426287', // Phone number in the allowed list
        email: 'test@example.com',
      };

      // Mock successful OTP response
      const response = {
        code: 200,
        status: true,
        message: 'OTP sent successfully',
        data: [],
      };

      // Mock external service calls
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(response);

      const result = await service.otpGeneration(mockOtpGenerationDto);

      expect(result).toEqual(response);
      expect(service.otpGeneration).toHaveBeenCalledTimes(1);
    });
    it('should generate OTP for specific email', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '1234567890',
        email: 'tumansa01@gmail.com', // Allowed email
      };

      // Mock successful OTP response
      const response = {
        code: 200,
        status: true,
        message: 'OTP sent successfully',
        data: [],
      };

      // Mock external service calls
      jest.spyOn(service, 'otpGeneration').mockResolvedValue(response);

      const result = await service.otpGeneration(mockOtpGenerationDto);

      expect(result).toEqual(response);
      expect(service.otpGeneration).toHaveBeenCalledTimes(1);
    });
    it('should generate OTP for specific phone number', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '1231231231', // Invalid phone number in the allowed list for specific handling
        email: '',
      };
      // Mock successful OTP response
      const response = {
        statusCode: 200,
        message: 'OTP send Successfully',
        data: [],
      };

      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Mock findOneAndUpdate for the invalid phone number
      mockSubscriberModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ otp: '1111' }),
      });

      const result = await service.otpGeneration(mockOtpGenerationDto);

      expect(result).toEqual(response);
    });
    it('should send OTP for registered user by phone number', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '9426426287',
        email: '',
      };

      const mockUser = {
        name: 'John Doe',
        countryCode: '+91',
      };

      // Mock findOne to return a registered user
      mockSubscriberModel.findOne.mockResolvedValue(mockUser);

      // Mock SMS API call
      jest.spyOn(axios, 'post').mockResolvedValue({ data: 'SMS sent' });

      // Mock findOneAndUpdate
      mockSubscriberModel.findOneAndUpdate.mockResolvedValue({});

      // Call the OTP generation function
      const result = await service.otpGeneration(mockOtpGenerationDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'OTP send Successfully',
        data: [],
      });
    });
    it('should return unauthorized if user is not found by email', async () => {
      const mockOtpGenerationDto = {
        phoneNo: '',
        email: 'nonexistent@example.com', // Email not in the database
      };

      // Mock findOne to return null (user not found)
      mockSubscriberModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.otpGeneration(mockOtpGenerationDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('login', () => {
    it('should return error if OTP is not provided when phoneNo is provided', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: null,
        email: 'test@gmail.com',
      };

      // Mock subscriberModel to return a user
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'userId',
          phoneNo: mockLoginDto.phoneNo,
          name: 'John Doe',
          email: 'john@example.com',
        }),
      });

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 400,
        errorMessage: 'Please Enter OTP!!',
        data: [],
      });
    });
    it('should return error if user does not exist by phoneNo or email', async () => {
      const mockLoginDto = {
        phoneNo: '9999999999', // Invalid phone number
        otp: 1234,
        email: '',
      };

      // Mock subscriberModel to return null (user not found)
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login(mockLoginDto)).rejects.toThrowError(
        'Invalid contact number or Email!! PLease Register and OTP is send to your phone No. or email',
      );
    });
    it('should return login details if email and OTP are provided', async () => {
      const mockLoginDto = {
        phoneNo: '',
        otp: 1234,
        email: 'john@example.com',
      };

      // Mock subscriberModel to return a user
      const mockUser = {
        _id: 'userId',
        phoneNo: '9426426287',
        name: 'John Doe',
        email: mockLoginDto.email,
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(service, 'verifyOtp').mockResolvedValue({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        data: [],
      }); // Mock OTP verification

      // Mock JWT service to return tokens
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.login(mockLoginDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('Login Successful!!');
      expect(result.data[0]).toHaveProperty('access_token');
      expect(result.data[0]).toHaveProperty('refreshToken');
    });
    it('should return login details if phoneNo and OTP are provided', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: 1234, // Valid OTP
        email: '',
      };

      // Mock subscriberModel to return a user
      const mockUser = {
        _id: 'userId',
        phoneNo: mockLoginDto.phoneNo,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(service, 'verifyOtp').mockResolvedValue({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        data: [],
      }); // Mock OTP verification

      // Mock JWT service to return tokens
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.login(mockLoginDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('Login Successful!!');
      expect(result.data[0]).toHaveProperty('access_token');
      expect(result.data[0]).toHaveProperty('refreshToken');
    });
    it('should return error if OTP is invalid', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: null, // Invalid OTP
        email: '',
      };

      // Mock subscriberModel to return a user
      const mockUser = {
        _id: 'userId',
        phoneNo: mockLoginDto.phoneNo,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 400,
        errorMessage: 'Please Enter OTP!!',
        data: [],
      });
    });
    it('should generate access and refresh tokens on successful login', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: 1234, // Valid OTP
        email: '',
      };

      // Mock subscriberModel to return a user
      const mockUser = {
        _id: 'userId',
        phoneNo: mockLoginDto.phoneNo,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(service, 'verifyOtp').mockResolvedValue({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        data: [],
      }); // Mock OTP verification

      // Mock JWT service to return tokens
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.login(mockLoginDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('Login Successful!!');
      expect(result.data[0].access_token).toBe('mockToken');
      expect(result.data[0].refreshToken).toBe('mockToken');
    });
    it('should return error if OTP is missing', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: null, // Missing OTP
        email: '',
      };

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 400,
        errorMessage: 'Please Enter OTP!!',
        data: [],
      });
    });
    it('should call verifyOtp method when OTP is provided', async () => {
      const mockLoginDto = {
        phoneNo: '9426426287',
        otp: 1234, // Valid OTP
        email: '',
      };

      // Mock subscriberModel to return a user
      const mockUser = {
        _id: 'userId',
        phoneNo: mockLoginDto.phoneNo,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });
      const verifyOtpSpy = jest.spyOn(service, 'verifyOtp').mockResolvedValue({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        data: [],
      }); // Mock OTP verification

      // Mock JWT service to return tokens
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      await service.login(mockLoginDto);

      expect(verifyOtpSpy).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('validatePhoneNo', () => {
    it('should return 400 if user not found by phoneNo', async () => {
      const mockValidationDto = { phoneNo: '9876543210', email: '' };

      // Mock no user found
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validatePhoneNo(mockValidationDto);

      expect(result).toEqual({
        statusCode: 400,
        errorMessage: 'Invalid contact number or Email!!',
        data: { isNewUser: true },
      });
    });

    it('should return 400 if user not found by email', async () => {
      const mockValidationDto = { phoneNo: '', email: 'test@example.com' };

      // Mock no user found
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validatePhoneNo(mockValidationDto);

      expect(result).toEqual({
        statusCode: 400,
        errorMessage: 'Invalid contact number or Email!!',
        data: { isNewUser: true },
      });
    });

    it('should return 200 if user found by phoneNo', async () => {
      const mockValidationDto = { phoneNo: '9876543210', email: '' };

      // Mock user found
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'userId' }),
      });

      const result = await service.validatePhoneNo(mockValidationDto);

      expect(result).toEqual({
        statusCode: 200,
        errorMessage: 'Email or PhoneNo. does not Exist!!',
        data: [],
      });
    });

    it('should return 200 if user found by email', async () => {
      const mockValidationDto = { phoneNo: '', email: 'test@example.com' };

      // Mock user found
      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'userId' }),
      });

      const result = await service.validatePhoneNo(mockValidationDto);

      expect(result).toEqual({
        statusCode: 200,
        errorMessage: 'Email or PhoneNo. does not Exist!!',
        data: [],
      });
    });
  });

  describe('verifyOtp', () => {
    it('should return success for special phone number without OTP validation', async () => {
      const mockLoginDto = {
        phoneNo: '1231231231',
        otp: 1234,
        email: '',
      };

      const mockUser = {
        _id: 'userId',
        phoneNo: '1231231231',
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.verifyOtp(mockLoginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'OTP verified successfully',
        data: {
          isEmailExist: true,
          isOldUser: false,
          id: 'userId',
          accessToken: 'mockToken',
        },
      });
    });

    it('should return OTP_EXPIRED if OTP is correct but expired', async () => {
      const mockLoginDto = {
        phoneNo: '9876543210',
        otp: 123456,
        email: '',
      };

      const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes old (expired)

      const mockUser = {
        _id: 'userId',
        phoneNo: '9876543210',
        otp: '123456',
        expiredDate: oldDate,
        isOldUser: true,
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.verifyOtp(mockLoginDto);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Invalid OTP!!',
        data: [],
      });
    });

    it('should verify OTP successfully and return token', async () => {
      const mockLoginDto = {
        phoneNo: '9876543210',
        otp: 123456,
        email: '',
      };

      const validDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      const mockUser = {
        _id: 'userId',
        phoneNo: '9876543210',
        otp: 123456, // <--- MATCHING VALUE
        expiredDate: validDate,
        isOldUser: true,
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      mockJwtService.signAsync.mockResolvedValue('mockToken');
      mockSubscriberModel.updateOne = jest.fn().mockResolvedValue({});

      const result = await service.verifyOtp(mockLoginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'OTP verified successfully',
        data: {
          isEmailExist: false,
          isOldUser: true,
          id: 'userId',
          accessToken: 'mockToken',
        },
      });

      expect(mockSubscriberModel.updateOne).toHaveBeenCalledWith(
        { _id: 'userId' },
        { isVerified: 1, status: 'Verified' },
      );
    });

    it('should return error if OTP is invalid', async () => {
      const mockLoginDto = {
        phoneNo: '9876543210',
        otp: null,
        email: '',
      };

      const mockUser = {
        _id: 'userId',
        phoneNo: '9876543210',
        otp: 1234, // Correct OTP in DB
        expiredDate: new Date(),
        isOldUser: true,
      };

      mockSubscriberModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.verifyOtp(mockLoginDto);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Invalid OTP!!',
        data: [],
      });
    });
  });

  describe('updateUser', () => {
    it('should throw HttpException if user not found', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const userId = 'someUserId';
      const updateUserDto = {
        phoneNo: '9876543210', // Provide a valid phone number
      };

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        HttpException,
      );

      await expect(
        service.updateUser(userId, updateUserDto),
      ).rejects.toMatchObject({
        response: {
          message: 'Subscriber not found', // customize based on your `message.subscriber.SUBSCRIBER_NOT_FOUND`
          errors: 'Bad Request',
        },
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should update user successfully and return success response', async () => {
      const userId = 'someUserId';
      const user = { _id: userId };

      const updateUserDto = {
        name: 'John Doe',
        phoneNo: '9876543210',
      };

      mockSubscriberModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      mockSubscriberModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      mockBaseResponse.sendResponse.mockReturnValue('mocked response');

      const result = await service.updateUser(userId, updateUserDto);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(result).toBe('mocked response');
    });

    it('should convert specific IDs to mongoose ObjectId', async () => {
      const userId = 'someUserId';
      const user = { _id: userId };

      const updateUserDto = {
        stateId: new mongoose.Types.ObjectId('654321abcdefabcdefabcdef'),
        countryId: new mongoose.Types.ObjectId('654321abcdefabcdefabcdef'),
        districtId: new mongoose.Types.ObjectId('654321abcdefabcdefabcdef'),
        blockId: new mongoose.Types.ObjectId('654321abcdefabcdefabcdef'),
        healthFacilityId: new mongoose.Types.ObjectId(
          '654321abcdefabcdefabcdef',
        ),
        cadreId: new mongoose.Types.ObjectId('654321abcdefabcdefabcdef'),
      };

      mockSubscriberModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      mockSubscriberModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      mockBaseResponse.sendResponse.mockReturnValue('mocked response');

      const result = await service.updateUser(userId, {
        ...updateUserDto,
        phoneNo: '',
      });

      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          stateId: new mongoose.Types.ObjectId(updateUserDto.stateId),
          countryId: new mongoose.Types.ObjectId(updateUserDto.countryId),
          districtId: new mongoose.Types.ObjectId(updateUserDto.districtId),
          blockId: new mongoose.Types.ObjectId(updateUserDto.blockId),
          healthFacilityId: new mongoose.Types.ObjectId(
            updateUserDto.healthFacilityId,
          ),
          cadreId: new mongoose.Types.ObjectId(updateUserDto.cadreId),
          phoneNo: '',
        },
      );
      expect(result).toBe('mocked response');
    });
  });

  describe('userProfile', () => {
    const mockFindById = (subscriber) => {
      return {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(subscriber),
      };
    };
    const mockFindByIdWithPopulate = (subscriber) => ({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        ...subscriber,
        populate: jest.fn().mockResolvedValue(subscriber),
        toObject: jest.fn().mockReturnValue(subscriber), // needed for spreading in code
      }),
    });

    it('should throw HttpException if subscriber not found', async () => {
      const id = new mongoose.Types.ObjectId().toString();

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.userProfile(id)).rejects.toThrow(HttpException);
      await expect(service.userProfile(id)).rejects.toThrow(
        'Subscriber not found',
      );
    });

    it('should update subscriber if manager exists and no queryDetails.instituteId', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const manager = {
        instituteId: new mongoose.Types.ObjectId().toString(),
        role: new mongoose.Types.ObjectId().toString(),
      };
      const subscriber = {
        _id: id,
        userContext: {
          queryDetails: {
            instituteId: null,
          },
        },
      };

      mockInstituteModel.findOne.mockResolvedValue(manager);
      mockSubscriberModel.findById
        .mockReturnValueOnce(mockFindById(subscriber)) // for initial subscriber
        .mockReturnValueOnce(mockFindByIdWithPopulate(subscriber)); // for getSubscriberById after progress

      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue({});
      mockSubscriberProgressService.getOverallAchievement.mockResolvedValue({});
      mockBaseResponse.sendResponse.mockReturnValue('response');

      const result = await service.userProfile(id);

      expect(result).toEqual('response');
    });

    it('should not update subscriber if queryDetails already exist', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const manager = {
        instituteId: new mongoose.Types.ObjectId().toString(),
        role: new mongoose.Types.ObjectId().toString(),
      };
      const subscriber = {
        _id: id,
        userContext: {
          queryDetails: {
            instituteId: new mongoose.Types.ObjectId().toString(),
            isActive: true,
            querySolved: 0,
            type: new mongoose.Types.ObjectId().toString(),
          },
        },
      };
      mockInstituteModel.findOne.mockResolvedValue(manager);
      mockSubscriberModel.findById
        .mockReturnValueOnce(mockFindById(subscriber)) // for initial subscriber
        .mockReturnValueOnce(mockFindByIdWithPopulate(subscriber));
      // mockSubscriberModel.findByIdAndUpdate.mockResolvedValue(undefined);

      mockSubscriberProgressService.getOverallAchievement.mockResolvedValue({});

      const result = await service.userProfile(id);

      // expect(mockSubscriberModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result).toEqual('response');
    });

    it('should merge user progress data if available', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const subscriber = {
        _id: id,
        toObject: jest.fn().mockReturnValue({ name: 'test user' }),
        populate: jest.fn(),
        userContext: {
          queryDetails: {
            instituteId: new mongoose.Types.ObjectId(),
          },
        },
      };
      const userProgressData = {
        data: { totalProgress: 85 },
      };

      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById
        .mockReturnValueOnce(mockFindById(subscriber)) // for initial subscriber
        .mockReturnValueOnce(mockFindByIdWithPopulate(subscriber));
      mockSubscriberProgressService.getOverallAchievement.mockResolvedValue(
        userProgressData,
      );

      const result = await service.userProfile(id);
      expect(result).toEqual('response');
    });

    it('should populate type if queryDetails exist', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const subscriber = {
        _id: id,
        toObject: jest.fn().mockReturnValue({}),
        populate: jest.fn(),
        userContext: {
          queryDetails: {
            type: new mongoose.Types.ObjectId(),
          },
        },
      };

      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById
        .mockReturnValueOnce(mockFindById(subscriber)) // for initial subscriber
        .mockReturnValueOnce(mockFindByIdWithPopulate(subscriber));
      mockSubscriberProgressService.getOverallAchievement.mockResolvedValue({});

      const result = await service.userProfile(id);

      expect(result).toEqual('response');
    });
  });

  describe('getSubscriberList', () => {
    it('should return all subscribers if no search term is provided', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      }; // Empty search to get all subscribers

      const mockSubscribers = [
        {
          name: 'John Doe',
          phoneNo: '1234567890',
          email: 'john@example.com',
          cadreId: '123',
        },
        {
          name: 'Jane Doe',
          phoneNo: '0987654321',
          email: 'jane@example.com',
          cadreId: '456',
        },
      ];

      mockSubscriberModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSubscribers),
        }),
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      const result = await service.getSubscribersList(paginationDto);

      expect(mockSubscriberModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });

    it('should return subscribers matching search term for name', async () => {
      const paginationDto: PaginationDto = {
        search: 'John',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      }; // Searching for "John"

      const mockSubscribers = [
        {
          name: 'John Doe',
          phoneNo: '1234567890',
          email: 'john@example.com',
          cadreId: '123',
        },
      ];

      mockSubscriberModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSubscribers),
        }),
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      const result = await service.getSubscribersList(paginationDto);

      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        $or: [
          { name: new RegExp('John', 'i') }, // Searching with case-insensitive regex
          { phoneNo: new RegExp('John', 'i') }, // Searching with case-insensitive regex
        ],
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });

    it('should return subscribers matching search term for phone number', async () => {
      const paginationDto: PaginationDto = {
        search: '1234567890',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      }; // Searching for phone number

      const mockSubscribers = [
        {
          name: 'John Doe',
          phoneNo: '1234567890',
          email: 'john@example.com',
          cadreId: '123',
        },
      ];

      mockSubscriberModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSubscribers),
        }),
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      const result = await service.getSubscribersList(paginationDto);

      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        $or: [
          { name: new RegExp('1234567890', 'i') }, // Searching with case-insensitive regex
          { phoneNo: new RegExp('1234567890', 'i') }, // Searching with case-insensitive regex
        ],
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });

    it('should return empty array when no subscribers match search term', async () => {
      const paginationDto: PaginationDto = {
        search: 'NotExistingName',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      }; // Searching for a non-existing name

      const mockSubscribers = [];

      mockSubscriberModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSubscribers),
        }),
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      const result = await service.getSubscribersList(paginationDto);

      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        $or: [
          { name: new RegExp('NotExistingName', 'i') }, // Searching with case-insensitive regex
          { phoneNo: new RegExp('NotExistingName', 'i') }, // Searching with case-insensitive regex
        ],
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });
  });

  describe('getAllSubscriber', () => {
    it('should return all subscribers without filters', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        states: '',
        districts: '',
        cadres: '',
        countries: '',
        blocks: '',
      };

      const userId = 'user123'; // Mock userId
      const mockSubscribers = [
        {
          name: 'John Doe',
          phoneNo: '1234567890',
          email: 'john@example.com',
          cadreId: '123',
        },
        {
          name: 'Jane Doe',
          phoneNo: '0987654321',
          email: 'jane@example.com',
          cadreId: '456',
        },
      ];

      // Mock filterService and adminService methods
      mockFilterService.filter.mockResolvedValue({}); // Empty filter, return all
      mockAdminService.adminRoleFilter.mockResolvedValue({}); // No role-based filtering

      // Mock aggregate method to return the subscribers
      mockSubscriberModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscribers),
      });

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      // Call the function under test
      const result = await service.getAllSubscribers(paginationDto, userId);

      // Assert the result
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });
    it('should apply filtering when filters like states, districts, etc., are provided', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        states: '6666c830eb18953046b1b56b',
        districts: '6666c830eb18953046b1b56b',
        cadres: '6666c830eb18953046b1b56b',
        countries: '6666c830eb18953046b1b56b',
        blocks: '6666c830eb18953046b1b56b',
      };

      const userId = '6666c830eb18953046b1b56b'; // Mock userId
      const mockSubscribers = [
        {
          name: 'John Doe',
          phoneNo: '1234567890',
          email: 'john@example.com',
          cadreId: '6666c830eb18953046b1b56b',
        },
      ];

      // Mock filterService and adminService methods
      mockFilterService.filter.mockResolvedValue({}); // Mock any filters
      mockAdminService.adminRoleFilter.mockResolvedValue({}); // No role-based filtering

      // Mock aggregate method to return filtered results
      mockSubscriberModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscribers),
      });

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      // Call the function under test
      const result = await service.getAllSubscribers(paginationDto, userId);

      // Assert the result
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      // Check that the aggregation includes filters for `states`, `districts`, etc.
      expect(mockSubscriberModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: 'states',
              pipeline: expect.arrayContaining([
                expect.objectContaining({
                  $match: {
                    _id: new mongoose.Types.ObjectId(
                      '6666c830eb18953046b1b56b',
                    ),
                  },
                }),
              ]),
            }),
          }),
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: 'districts',
              pipeline: expect.arrayContaining([
                expect.objectContaining({
                  $match: {
                    _id: new mongoose.Types.ObjectId(
                      '6666c830eb18953046b1b56b',
                    ),
                  },
                }),
              ]),
            }),
          }),
          // Additional checks for other filters like cadres, countries, etc.
        ]),
      );
    });
    it('should return an empty array when no subscribers match', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
        states: '6666c830eb18953046b1b56b',
        districts: '6666c830eb18953046b1b56b',
        cadres: '6666c830eb18953046b1b56b',
        countries: '6666c830eb18953046b1b56b',
        blocks: '6666c830eb18953046b1b56b',
      };

      const userId = '6666c830eb18953046b1b56b'; // Mock userId
      const mockSubscribers: any[] = []; // No subscribers found

      // Mock filterService and adminService methods
      mockFilterService.filter.mockResolvedValue({}); // No filter
      mockAdminService.adminRoleFilter.mockResolvedValue({}); // No role-based filtering

      // Mock aggregate method to return empty result
      mockSubscriberModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscribers),
      });

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });

      // Call the function under test
      const result = await service.getAllSubscribers(paginationDto, userId);

      // Assert the result
      expect(result).toEqual({
        statusCode: 200,
        message: 'Subscriber List',
        data: mockSubscribers,
      });
    });
  });

  describe('logout', () => {
    it('should successfully log the user out', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
        userId: 'userId',
      };

      // Mock the refreshToken method to simulate successful execution
      service.refreshToken = jest.fn().mockResolvedValue(undefined);

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });

      // Call the function under test
      const result = await service.logout(refreshTokenDto);

      // Assert that the refreshToken method was called
      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);

      // Assert the response returned is as expected
      expect(result).toEqual({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });

      // Verify sendResponse method was called with the expected arguments
      expect(result).toEqual({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });
    });
    it('should throw an error if refreshToken fails', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
        userId: 'userId',
      };
      // Mock the refreshToken method to throw an error
      service.refreshToken = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

      // Call the function under test and assert that it throws an error
      try {
        await service.logout(refreshTokenDto);
      } catch (e) {
        expect(e.message).toBe('Invalid token');
      }

      // Ensure that sendResponse was not called in case of an error
      expect(mockBaseResponse.sendResponse).not.toHaveBeenCalled();
    });
    it('should handle the case where no token is provided', async () => {
      // Create a refreshTokenDto without the token
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: '', // No token provided
        userId: 'userId',
      };

      // Mock the baseResponse.sendResponse method to return the error response
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 400,
        message: 'Token is required',
        data: [],
      });

      // Ensure refreshToken method is not called when no token is provided
      service.refreshToken = jest.fn(); // Ensure it's mocked but not called in this test case

      // Call the function under test
      const result = await service.logout(refreshTokenDto);

      // Assert the response returned is as expected
      expect(result).toEqual({
        statusCode: 400,
        message: 'Token is required',
        data: [],
      });

      // Ensure that refreshToken was not called when no token is provided
      expect(service.refreshToken).not.toHaveBeenCalled();
    });
    it('should pass the correct refreshTokenDto to the refreshToken method', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
        userId: 'userId',
      };

      // Mock the refreshToken method
      service.refreshToken = jest.fn().mockResolvedValue(undefined);

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });

      // Call the function under test
      await service.logout(refreshTokenDto);

      // Verify that refreshToken was called with the correct token
      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
    it('should handle multiple logout attempts', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
        userId: 'userId',
      };

      // Mock the refreshToken method to simulate successful execution
      service.refreshToken = jest.fn().mockResolvedValue(undefined);

      // Mock the baseResponse.sendResponse method
      mockBaseResponse.sendResponse = jest.fn().mockReturnValue({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });

      // Call the logout method twice
      const result1 = await service.logout(refreshTokenDto);
      const result2 = await service.logout(refreshTokenDto);

      // Assert that the refreshToken method was called twice
      expect(service.refreshToken).toHaveBeenCalledTimes(2);

      // Assert the response for both calls
      expect(result1).toEqual({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });
      expect(result2).toEqual({
        statusCode: 200,
        message: 'User Logout Successfully!!',
        data: [],
      });

      // Ensure sendResponse was called for both logout attempts
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledTimes(2);
    });
  });
});
