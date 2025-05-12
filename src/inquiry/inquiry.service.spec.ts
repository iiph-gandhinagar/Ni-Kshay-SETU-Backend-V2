import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { InquiryAggregate } from '../common/pagination/inquiryAggregation.service';
import { InquiryService } from './inquiry.service';
const mockInquiryModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  InquiryAggregate: jest.fn(),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Inquiry' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Inquiry' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};
jest.mock('../common/pagination/inquiryAggregation.service', () => ({
  InquiryAggregate: jest.fn(),
}));
const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

const mockSubscriberModel = {
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test' }),
};

const mockEmailService = {
  sendEnquiryDetail: jest.fn(),
};

const mockAdminUserModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
  }),
};
const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};
describe('InquiryService', () => {
  let service: InquiryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiryService,
        { provide: getModelToken('Inquiry'), useValue: mockInquiryModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: AdminService, useValue: mockAdminService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<InquiryService>(InquiryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new inquiry and send an email', async () => {
      const createInquiryDto = {
        subject: 'Test Subject',
        message: 'Test Message',
        userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        email: 'abc@gmil.com',
        type: 'web',
      };

      const mockUserDetails = {
        name: 'John Doe',
        phoneNo: '1234567890',
        email: 'john.doe@example.com',
      };

      const mockInquiry = {
        ...createInquiryDto,
        userId: new mongoose.Types.ObjectId('64f1a3f1c2e4567abc123456'),
        name: mockUserDetails.name,
        phoneNo: mockUserDetails.phoneNo,
        _id: new mongoose.Types.ObjectId('64f1b3f1c2e4567abc123457'),
      };

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUserDetails),
      });

      mockInquiryModel.create.mockResolvedValue(mockInquiry);
      mockEmailService.sendEnquiryDetail.mockResolvedValue(undefined);

      const result = await service.create(
        mockInquiry,
        '64f1b3f1c2e4567abc123457',
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        '64f1b3f1c2e4567abc123457',
      );
      expect(mockInquiryModel.create).toHaveBeenCalledWith(mockInquiry);
      expect(mockEmailService.sendEnquiryDetail).toHaveBeenCalledWith(
        mockUserDetails.email,
        createInquiryDto.subject,
        createInquiryDto.message,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Inquiry Created successfully',
        data: mockInquiry,
      });
    });
    it('should throw an error if user not found', async () => {
      const createInquiryDto = {
        subject: 'Test Subject',
        message: 'Test Message',
        userId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        name: 'abc',
        email: 'abc@gmil.com',
        phoneNo: '9999999999',
        type: 'web',
      };
      const userId = '64f1a3f1c2e4567abc123456';

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createInquiryDto, userId)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockInquiryModel.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendEnquiryDetail).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return inquiry with pagination', async () => {
      const userId = '12345';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockSurveyHistory = [
        { subject: 'inquiry 1' },
        { subject: 'inquiry 2' },
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
      (InquiryAggregate as jest.Mock).mockResolvedValue(mockSurveyHistory);

      const result = await service.findAll(paginationDto, userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(InquiryAggregate).toHaveBeenCalledWith(
        mockInquiryModel,
        paginationDto,
        {},
      );
      expect(result).toEqual(mockSurveyHistory);
    });
    it('should throw an error if adminUser is not found', async () => {
      const userId = 'invalidId';
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAdminUser = {
        isAllState: false,
        state: undefined,
      };
      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser), // Simulating no user found
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException(
          'Admin User not found or state is missing or district is missing',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
    it('should throw an error if adminUser state is missing or district is missing', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const userId = 'validUserId';
      const mockAdminUser = {
        isAllState: false,
        state: undefined,
      };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException(
          'Admin User not found or state is missing or district is missing',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
    it('should throw an error if adminUser state is missing or district is missing', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const userId = 'validUserId';
      const mockAdminUser = {
        isAllDistrict: false,
        district: undefined,
      };

      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAdminUser),
      });

      await expect(service.findAll(paginationDto, userId)).rejects.toThrowError(
        new HttpException(
          'Admin User not found or state is missing or district is missing',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
