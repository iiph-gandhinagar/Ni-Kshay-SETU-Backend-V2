import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { WatiService } from 'src/common/utils/wati.service';
import { UploadController } from 'src/upload/upload.controller';
import { Readable } from 'stream';
import { paginate } from '../common/pagination/pagination.service';
import { ManageTbService } from './manage-tb.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockManageTbModel = {
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

const mockEmailService = {
  sendPrescription: jest.fn(),
};

const mockPrescriptionModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  sendTemplateMessage: jest.fn().mockResolvedValue([]),
};

const mockUploadModel = {
  sendTemplateMessage: jest.fn().mockResolvedValue([]),
};

const mockWatiService = {
  sendTemplateMessage: jest.fn().mockResolvedValue([]),
};

const mockSubscriberModel = {
  findById: jest.fn().mockResolvedValue({
    select: jest.fn().mockReturnValue({ name: 'Admin', phoneNo: '0999999999' }),
  }),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('ManageTbService', () => {
  let service: ManageTbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageTbService,
        { provide: getModelToken('ManageTb'), useValue: mockManageTbModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('Prescription'),
          useValue: mockPrescriptionModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: EmailService, useValue: mockEmailService },
        { provide: WatiService, useValue: mockWatiService },
        { provide: UploadController, useValue: mockUploadModel },
      ],
    }).compile();

    service = module.get<ManageTbService>(ManageTbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a prescription successfully', async () => {
      const dto = { test: 'value' }; // your CreateManageTbDto shape
      const apiData = { key: 'value' };
      mockedAxios.post.mockResolvedValue({
        data: { data: apiData },
      });

      mockPrescriptionModel.create.mockResolvedValue(apiData);

      const result = await service.create(dto as any);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${process.env.MANAGE_TB_URL}/update_cells_v2/`,
        dto,
      );
      // In your test
      expect(mockPrescriptionModel.create).toHaveBeenCalledWith(apiData);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Prescription Details!!',
        data: { data: apiData },
      });
    });

    it('should return an error if Python service fails', async () => {
      const dto = { test: 'value' };
      const error = new Error('Python service down');
      mockedAxios.post.mockRejectedValue(error);

      const result = await service.create(dto as any);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Python Api response Error!!',
        data: error,
      });
    });
  });

  describe('storeChangesOfManageTb', () => {
    it('should store manage TB changes and call external API', async () => {
      const dto = {
        someField: 'value',
      };
      const userId = '66167dcf0b19b2043890f554';

      const storedDoc = {
        ...dto,
        createdBy: new mongoose.Types.ObjectId(userId),
      };
      mockManageTbModel.create.mockResolvedValue(dto);
      (axios.get as jest.Mock).mockResolvedValue({ data: {} });

      const result = await service.storeChangesOfManageTB(dto as any, userId);

      expect(mockManageTbModel.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: expect.any(mongoose.Types.ObjectId),
      });
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.MANAGE_TB_URL}/delete_and_create_sheets`,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Manage Tb Created successfully', // adjust if you have `message.manageTb.MANAGE_TB_CREATED`
        data: storedDoc,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results with populated createdBy field', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        fromDate: '',
        toDate: '',
      };

      const fakeQuery = { isActive: true };
      const fakeResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      (mockFilterService.filter as jest.Mock).mockResolvedValue(fakeQuery);
      (paginate as jest.Mock).mockResolvedValue(fakeResult);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockManageTbModel,
        paginationDto,
        [
          {
            path: 'createdBy',
            select: 'firstName lastName email',
          },
        ],
        fakeQuery,
      );
      expect(result).toEqual(fakeResult);
    });
  });

  describe('sessionApi', () => {
    it('should return successful session response', async () => {
      const fakeResponse = { sessionId: 'abc123' };
      (axios.post as jest.Mock).mockResolvedValue({ data: fakeResponse });

      const result = await service.sessionApi();

      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.MANAGE_TB_URL}/start_session/`,
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'WorkBook Id!!',
        fakeResponse,
      );
      expect(result).toEqual(
        mockBaseResponse.sendResponse.mock.results[0].value,
      );
    });

    it('should handle error and return error response', async () => {
      const error = new Error('Something went wrong');
      (axios.post as jest.Mock).mockRejectedValue(error);

      const result = await service.sessionApi();

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Python Api response Error!!',
        error,
      );
      expect(result).toEqual(
        mockBaseResponse.sendResponse.mock.results[0].value,
      );
    });
  });

  describe('sendPrescriptionOnWhatsApp', () => {
    it('should send prescription via WhatsApp and return success response', async () => {
      const userId = 'user123';

      const sendPrescriptionOnPhone = {
        prescription: {
          name: 'admin',
          notes: 'note',
          diagnosis: 'diagnosis',
          regimen: 'regimen',
          prescription: 'prescription',
        },
      };

      const userMock = { name: 'John Doe', phoneNo: '9876543210' };

      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(userMock),
      });

      mockWatiService.sendTemplateMessage.mockResolvedValue(true);
      mockBaseResponse.sendResponse.mockReturnValue('success');

      const result = await service.sendPrescriptionOnWhatsApp(
        sendPrescriptionOnPhone,
        userId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockWatiService.sendTemplateMessage).toHaveBeenCalledWith(
        `91${userMock.phoneNo}`,
        sendPrescriptionOnPhone.prescription,
      );
      expect(result).toEqual('success');
    });

    it('should handle error and return error response', async () => {
      const userId = 'user123';
      const sendPrescriptionOnPhone = {
        prescription: {
          name: 'admin',
          notes: 'note',
          diagnosis: 'diagnosis',
          regimen: 'regimen',
          prescription: 'prescription',
        },
      };

      const error = new Error('DB error');
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockRejectedValue(error),
      });

      mockBaseResponse.sendResponse.mockReturnValue('error');

      const result = await service.sendPrescriptionOnWhatsApp(
        sendPrescriptionOnPhone,
        userId,
      );
      expect(result).toEqual('error');
    });
  });

  describe('downloadPrescription', () => {
    it('should generate PDF and return it in the response', async () => {
      const sendPrescriptionOnPhone = {
        prescription: {
          notes: 'Some notes',
          diagnosis: 'Diagnosis info',
          regimen: 'Regimen info',
          prescription: 'Prescription info',
          name: 'Admin',
        },
      };

      const mockStream = Readable.from(['mock pdf content']);

      // Mock the generatePDF method to return the mock stream
      jest.spyOn(service, 'generatePDF').mockResolvedValueOnce(mockStream);

      // Mock the response service
      mockBaseResponse.sendResponse.mockReturnValueOnce({
        statusCode: 200,
        message: 'Prescription Details!!',
        data: mockStream,
      });

      const result = await service.downloadPrescription(
        sendPrescriptionOnPhone,
      );

      expect(service.generatePDF).toHaveBeenCalledWith(
        'Some notes',
        'Diagnosis info',
        'Regimen info',
        'Prescription info',
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Prescription Details!!',
        data: mockStream,
      });
    });
  });

  describe('emailPrescription', () => {
    const userId = 'user123';

    const sendPrescriptionOnPhone = {
      prescription: {
        name: 'admin',
        notes: 'note',
        diagnosis: 'diagnosis',
        regimen: 'regimen',
        prescription: 'prescription',
      },
    };

    const userMock = {
      name: 'John Doe',
      phoneNo: '9876543210',
      email: 'john@example.com',
    };

    const pdfStreamMock = {
      code: 200,
      status: true,
      message: 'Prescription Details!!',
      data: Buffer.from('PDF data here'),
    };
    it('should send prescription via email and return success response', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(userMock),
      });

      jest
        .spyOn(service, 'downloadPrescription')
        .mockResolvedValueOnce(pdfStreamMock);

      mockEmailService.sendPrescription.mockResolvedValueOnce(true);

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Prescription Details!!',
        data: [],
      });

      const result = await service.emailPrescription(
        sendPrescriptionOnPhone,
        userId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(service.downloadPrescription).toHaveBeenCalledWith(
        sendPrescriptionOnPhone,
      );
      expect(mockEmailService.sendPrescription).toHaveBeenCalledWith(
        userMock.email,
        userMock.name,
        pdfStreamMock.data,
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Prescription Details!!',
        [],
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Prescription Details!!',
        data: [],
      });
    });

    it('should handle missing email and return error response', async () => {
      const userMockMissingEmail = { ...userMock, email: null };

      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(userMockMissingEmail),
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Email service Issue (manage tb)',
        data: expect.anything(),
      });

      const result = await service.emailPrescription(
        sendPrescriptionOnPhone,
        userId,
      );

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Email service Issue (manage tb)',
        expect.anything(),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Email service Issue (manage tb)',
        data: expect.anything(),
      });
    });

    it('should handle unexpected error and return error response', async () => {
      const dbError = new Error('email Update!');

      mockSubscriberModel.findById.mockImplementationOnce(() => {
        throw dbError;
      });

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'Email service Issue (manage tb)',
        data: dbError,
      });

      const result = await service.emailPrescription(
        sendPrescriptionOnPhone,
        userId,
      );

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Email service Issue (manage tb)',
        dbError,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Email service Issue (manage tb)',
        data: dbError,
      });
    });
  });
});
