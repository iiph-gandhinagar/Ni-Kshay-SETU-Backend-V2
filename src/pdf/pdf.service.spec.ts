import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import mongoose from 'mongoose';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { Readable } from 'stream';
import { PdfService } from './pdf.service';

jest.mock('axios');
const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
  findById: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('PdfService', () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: BaseResponse, useValue: mockBaseResponse },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getAllCertificate', () => {
    it('should return certificates for a user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockCertificates = [
        {
          _id: 'assessmentId123',
          mostRecentAssessment: {
            _id: 'responseId456',
            userId: userId,
          },
          assessmentDetails: {
            title: 'Sample Assessment',
          },
        },
      ];

      mockAssessmentResponseModel.aggregate.mockResolvedValue(mockCertificates);

      const result = await service.getAllCertificate(userId);

      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalledWith(
        expect.any(Array),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Certificate List',
        data: mockCertificates,
      });
    });

    it('should handle empty certificate list', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockAssessmentResponseModel.aggregate.mockResolvedValue([]);

      const result = await service.getAllCertificate(userId);

      expect(mockAssessmentResponseModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Certificate List',
        data: [],
      });
    });
  });
  describe('getCertificate', () => {
    it('should return generated certificate PDF stream', async () => {
      const userId = 'user123';
      const assessmentResponseId = 'response456';

      // Mock user name
      const mockUser = { name: 'John Doe' };
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock assessment response with nested population
      const mockCertificate = {
        assessmentId: {
          title: { en: 'Assessment Title' },
          certificateType: {
            image: 'certificate.png',
            top: 150,
            left: 100,
          },
        },
        obtainedMarks: 80,
        totalMarks: 100,
      };
      mockAssessmentResponseModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCertificate),
        }),
      });

      // Mock image response
      jest.spyOn(axios, 'get').mockResolvedValue({ data: 'binaryImageData' });

      // Mock PDF generation
      const mockPDFStream = new Readable();
      mockPDFStream.push('mockedPDFStream');
      mockPDFStream.push(null);
      jest.spyOn(service, 'generatePDF').mockResolvedValue(mockPDFStream);

      const result = await service.getCertificate(userId, assessmentResponseId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAssessmentResponseModel.findById).toHaveBeenCalledWith(
        assessmentResponseId,
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.AWS_URL}certificate.png`,
        { responseType: 'arraybuffer' },
      );
      expect(service.generatePDF).toHaveBeenCalledWith(
        'John Doe',
        'Assessment Title',
        80,
        Buffer.from('binaryImageData', 'binary'),
        150,
        100,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Certificate List',
        data: expect.any(Readable),
      });
    });
  });
});
