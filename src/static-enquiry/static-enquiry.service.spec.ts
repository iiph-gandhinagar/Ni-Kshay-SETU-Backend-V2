import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticEnquiryService } from './static-enquiry.service';
const mockStaticEnquiryModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static-enquiry' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static-enquiry' }),
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

const mockEmailService = {
  sendEnquiryDetail: jest.fn().mockResolvedValue([]),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('StaticEnquiryService', () => {
  let service: StaticEnquiryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticEnquiryService,
        {
          provide: getModelToken('StaticEnquiry'),
          useValue: mockStaticEnquiryModel,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticEnquiryService>(StaticEnquiryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Static Enquiry', async () => {
      const createStaticEnquiryDto = {
        id: 1,
        subject: 'Static Enquiry',
        message: 'How TO start',
        email: 'Abc@gmail.com',
      };
      const mockStaticEnquiry = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticEnquiryDto,
      };
      mockStaticEnquiryModel.create.mockResolvedValue(mockStaticEnquiry);

      const result = await service.create(createStaticEnquiryDto);
      expect(mockStaticEnquiryModel.create).toHaveBeenCalledWith(
        createStaticEnquiryDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Enquiry store successfully!!',
        data: mockStaticEnquiry,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static Enquiry with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticEnquiries = [
        { name: 'Static enquiry 1' },
        { name: 'Static enquiry 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticEnquiries),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticEnquiryModel.find.mockReturnValue(mockQuery);
      mockStaticEnquiryModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticEnquiries,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticEnquiryModel.find).toHaveBeenCalled();
      expect(mockStaticEnquiryModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('inquiryCsv', () => {
    it('should return Static Enquiry csv', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
        sortBy: 'subject', // Ensure sortBy is defined
        sortOrder: 'asc',
      };
      const mockStaticEnquiries = [
        { subject: 'Static enquiry 1' },
        { subject: 'Static enquiry 2' },
      ];

      mockFilterService.filter.mockResolvedValue({});
      mockStaticEnquiryModel.find.mockReturnThis();
      mockStaticEnquiryModel.sort.mockReturnThis();
      mockStaticEnquiryModel.exec = jest
        .fn()
        .mockResolvedValue(mockStaticEnquiries);

      const result = await service.inquiryCsv(paginationDto);
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockStaticEnquiryModel.find).toHaveBeenCalledWith({});
      expect(mockStaticEnquiryModel.sort).toHaveBeenCalledWith({ subject: 1 });
      expect(result).toEqual({
        message: 'Enquiry Fetch successfully!!',
        data: mockStaticEnquiries,
        statusCode: 200,
      });
    });
  });
});
