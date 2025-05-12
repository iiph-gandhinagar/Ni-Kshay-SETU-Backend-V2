import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { AssessmentEnrollmentService } from './assessment-enrollment.service';
const mockAssessmentEnrolmentModel = {
  find: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Assessment Enrolment' }),
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
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AssessmentEnrollmentService', () => {
  let service: AssessmentEnrollmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentEnrollmentService,
        {
          provide: getModelToken('AssessmentEnrollment'),
          useValue: mockAssessmentEnrolmentModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AssessmentEnrollmentService>(
      AssessmentEnrollmentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return Assessment Enrolment with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAssessmentEnrolment = [
        { name: 'Assessment Enrolment 1' },
        { name: 'Assessment Enrolment 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAssessmentEnrolment),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAssessmentEnrolmentModel.find.mockReturnValue(mockQuery);
      mockAssessmentEnrolmentModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAssessmentEnrolment,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAssessmentEnrolmentModel.find).toHaveBeenCalled();
      expect(mockAssessmentEnrolmentModel.countDocuments).toHaveBeenCalledWith(
        {},
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated Assessment Enrolment', async () => {
      const updatedAssessmentEnrolment = {
        _id: '1',
        response: 'Updated Assessment Enrolment',
      };
      mockAssessmentEnrolmentModel.findByIdAndUpdate.mockResolvedValue(
        updatedAssessmentEnrolment,
      );

      const result = await service.update('1', {
        response: 'Updated Assessment Enrolment',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Assessment Enrollment updated successfully',
        data: updatedAssessmentEnrolment,
      });
      expect(
        mockAssessmentEnrolmentModel.findByIdAndUpdate,
      ).toHaveBeenCalledWith(
        '1',
        { response: 'Updated Assessment Enrolment' },
        { new: true },
      );
    });
  });
});
