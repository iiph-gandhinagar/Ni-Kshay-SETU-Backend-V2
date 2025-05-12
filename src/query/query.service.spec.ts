import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { CreateQueryDto, Gender } from './dto/create-query.dto';
import { QueryService } from './query.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockQueryModel = {
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
  updateMany: jest.fn(),
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

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockFirebaseService = {
  filter: jest.fn().mockResolvedValue([]),
};

const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn(),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
};

const mockRoleModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockInstituteModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockUserNotificationModel = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
};

const mockUserDeviceTokenModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockMasterInstituteModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('QueryService', () => {
  let service: QueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryService,
        { provide: getModelToken('Query'), useValue: mockQueryModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('Institute'), useValue: mockInstituteModel },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        {
          provide: getModelToken('MasterInstitute'),
          useValue: mockMasterInstituteModel,
        },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    service = module.get<QueryService>(QueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new query and return a success response', async () => {
      const dto = {
        raisedBy: new mongoose.Types.ObjectId('6440e6a7e8bc4c23f8d4a9ab'),
        queryRaisedRole: new mongoose.Types.ObjectId(
          '6440e6a7e8bc4c23f8d4a9ac',
        ),
        queryRaisedInstitute: new mongoose.Types.ObjectId(
          '6440e6a7e8bc4c23f8d4a9ad',
        ),
        queryRespondedInstitute: new mongoose.Types.ObjectId(
          '6440e6a7e8bc4c23f8d4a9ae',
        ),
        subject: 'Test subject',
        description: 'Test description',
        age: 20,
        sex: Gender.FEMALE,
        diagnosis: 'Test Diagnosis',
        dateOfAdmission: new Date(),
        query: 'Query Details',
        queryId: 'QC-DRTB-008',
      };

      const objectIdMock = new mongoose.Types.ObjectId();

      // Mock role lookup
      const roleName = { _id: objectIdMock, name: 'DRTB' };
      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(roleName),
      });

      // Mock last query
      const lastQuery = { queryId: 'QC-DRTB-007' };
      mockQueryModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(lastQuery),
        }),
      });

      // Mock parent institute
      const parentInstitute = { parentId: '6440e6a7e8bc4c23f8d4a9ae' };
      mockMasterInstituteModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(parentInstitute),
      });

      // Mock queryModel save
      const mockSavedQuery = {
        ...dto,
        _id: new mongoose.Types.ObjectId('6808bec6652c39f1d4e580cb'),
      };

      mockQueryModel.create.mockReturnValue(mockSavedQuery);

      // Mock notification
      const mockQuery2CoeNotification = jest
        .spyOn(service, 'query2CoeNotification')
        .mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(dto.queryRaisedRole),
      );
      expect(mockQueryModel.findOne).toHaveBeenCalled();
      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(dto.queryRaisedInstitute),
      );
      expect(mockQuery2CoeNotification).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(parentInstitute.parentId),
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query Created successfully',
        data: mockSavedQuery,
      });
    });

    it('should throw HttpException if queryRaisedRole is not found', async () => {
      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null), // simulate not found
      });

      const dto = {
        raisedBy: '6440e6a7e8bc4c23f8d4a9ab',
        queryRaisedRole: '6440e6a7e8bc4c23f8d4a9ac',
        queryRaisedInstitute: '6440e6a7e8bc4c23f8d4a9ad',
        subject: 'Test subject',
        description: 'Test description',
        age: 20,
        sex: Gender.FEMALE,
        diagnosis: 'Test Diagnosis',
        dateOfAdmission: new Date(),
        query: 'Query Details',
      };

      try {
        await service.create(dto as any);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          message: 'Query Raised Role Issue!!',
          errors: 'bad Request',
        });
      }
    });

    it('should throw HttpException if queryRaisedInstitute is not found', async () => {
      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ name: 'DRTB' }),
      });

      mockQueryModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null), // no previous query
      });

      mockMasterInstituteModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null), // simulate institute not found
      });

      const dto = {
        raisedBy: '6440e6a7e8bc4c23f8d4a9ab',
        queryRaisedRole: '6440e6a7e8bc4c23f8d4a9ac',
        queryRaisedInstitute: '6440e6a7e8bc4c23f8d4a9ad',
        subject: 'Test subject',
        description: 'Test description',
        age: 20,
        sex: Gender.FEMALE,
        diagnosis: 'Test Diagnosis',
        dateOfAdmission: new Date(),
        query: 'Query Details',
      };

      try {
        await service.create(dto as any);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          message: 'Query Raised Institute Issue!!',
          errors: 'Bad Request',
        });
      }
    });

    it('should fail validation if gender is invalid', async () => {
      const dto = plainToClass(CreateQueryDto, {
        raisedBy: '6440e6a7e8bc4c23f8d4a9ab',
        queryRaisedRole: '6440e6a7e8bc4c23f8d4a9ac',
        queryRaisedInstitute: '6440e6a7e8bc4c23f8d4a9ad',
        subject: 'Test subject',
        description: 'Test description',
        age: 20,
        sex: 'Dance', // ❌ Invalid
        diagnosis: 'Test Diagnosis',
        dateOfAdmission: new Date(),
        query: 'Query Details',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isEnum).toBe(
        'Gender must be one of the following: Male, Female, Transgender',
      );
    });
  });

  describe('queriesExport', () => {
    it('should return open and closed queries for RaisedInstitute', async () => {
      const mockInstituteId = '6440e6a7e8bc4c23f8d4a9ad';
      const paginationDto: PaginationDto = {
        type: 'RaisedInstitute',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };

      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(), // Return 'this' to allow chaining
        lean: jest.fn().mockResolvedValue({ role: { name: 'DRTB' } }),
      });

      const openData = { data: ['open1', 'open2'] };
      const closedData = { data: ['closed1'] };

      service.openQueryList = jest.fn().mockResolvedValue(openData);
      service.closedQueryList = jest.fn().mockResolvedValue(closedData);

      const result = await service.queriesExport(
        paginationDto,
        mockInstituteId,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: { openQueries: openData.data, closedQueries: closedData.data },
      });
    });

    it('should return open, closed, and transfer queries for RespondedInstitute', async () => {
      const mockInstituteId = '6440e6a7e8bc4c23f8d4a9ad';
      const paginationDto: PaginationDto = {
        type: 'RespondedInstitute',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };

      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(), // Return 'this' to allow chaining
        lean: jest.fn().mockResolvedValue({ role: { name: 'NODAL' } }),
      });

      const openData = { data: ['openA'] };
      const closedData = { data: ['closedA'] };
      const transferData = { data: ['transferA'] };

      service.openQueryList = jest.fn().mockResolvedValue(openData);
      service.closedQueryList = jest.fn().mockResolvedValue(closedData);
      service.transferQueryList = jest.fn().mockResolvedValue(transferData);

      const response = await service.queriesExport(
        paginationDto,
        mockInstituteId,
      );

      expect(response).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: {
          openQueries: openData.data,
          closedQueries: closedData.data,
          transferQueries: transferData.data,
        },
      });
    });

    it('should handle when no role is found', async () => {
      const paginationDto: PaginationDto = {
        type: 'RaisedInstitute',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockInstituteId = 'someId';

      // Mock the findById function and simulate populate behavior
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(), // Return 'this' to allow chaining
        lean: jest.fn().mockResolvedValue({ role: null }), // Mock the result to return role: null
      });

      service.openQueryList = jest.fn().mockResolvedValue({ data: [] });
      service.closedQueryList = jest.fn().mockResolvedValue({ data: [] });

      // Use expect().rejects to check for the error
      await expect(
        service.queriesExport(paginationDto, mockInstituteId),
      ).rejects.toThrowError(
        new HttpException(
          { statusCode: 400, message: 'Role not found for this institute' },
          400,
        ),
      );
    });
  });

  describe('queriesReport', () => {
    it('should return report for DRTB role', async () => {
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ role: { name: 'DRTB' } }),
      });

      mockQueryModel.countDocuments.mockResolvedValueOnce(10); // total
      mockQueryModel.countDocuments.mockResolvedValueOnce(5); // closed
      mockQueryModel.countDocuments.mockResolvedValueOnce(5); // open

      const result = await service.queriesReport('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: {
          totalQueries: 10,
          closedQueries: 5,
          openQueries: 5,
          transferQueries: 0,
        },
      });
    });

    it('should return report for NODAL role', async () => {
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ role: { name: 'NODAL' } }),
      });

      mockQueryModel.countDocuments
        .mockResolvedValueOnce(20) // total raised
        .mockResolvedValueOnce(10) // closed raised
        .mockResolvedValueOnce(10) // open raised
        .mockResolvedValueOnce(15) // total responded
        .mockResolvedValueOnce(8) // closed responded
        .mockResolvedValueOnce(5) // open responded
        .mockResolvedValueOnce(2) // transfer queries
        .mockResolvedValueOnce(1); // transfer responded

      const result = await service.queriesReport('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: {
          queryRaised: {
            totalQueries: 20,
            closedQueries: 10,
            openQueries: 10,
          },
          queryResponded: {
            totalQueriesResponded: 15,
            closedQueriesResponded: 8,
            openQueriesResponded: 5,
            transferQueries: 2,
            transferRespondedQueries: 1,
          },
        },
      });
    });

    it('should return report for other roles', async () => {
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ role: { name: 'OTHER' } }),
      });

      mockQueryModel.countDocuments
        .mockResolvedValueOnce(8) // total
        .mockResolvedValueOnce(4) // closed
        .mockResolvedValueOnce(3) // open
        .mockResolvedValueOnce(1); // transfer

      const result = await service.queriesReport('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: {
          totalQueries: 8,
          closedQueries: 4,
          openQueries: 3,
          transferQueries: 1,
        },
      });
    });
  });

  describe('queryHistory', () => {
    it('should return query history payload for a valid queryId', async () => {
      const queryId = '507f191e810c19729de860ea'; // Valid ObjectId string
      const mockPayload = {
        payload: [{ status: 'In Progress', message: 'First message' }],
      };

      mockQueryModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPayload),
      });
      const result = await service.queryHistory(queryId);

      expect(mockQueryModel.findById).toHaveBeenCalledWith(queryId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: mockPayload,
      });
    });
  });

  describe('closedQueryList', () => {
    it('should return closedQueries for DRTB role', async () => {
      const instituteId = '507f191e810c19729de860ea';
      const role = { name: 'DRTB' };
      const mockInstitute = { role };

      const mockQueries = [
        {
          _id: 'query1',
          message: 'Resolved',
          payload: [{ status: 'In Progress' }],
        },
      ];

      // Mock role population
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInstitute),
      });

      mockQueryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockQueries),
      });

      const result = await service.closedQueryList(instituteId);

      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        instituteId,
      );
      expect(mockQueryModel.find).toHaveBeenCalledWith({
        queryRaisedInstitute: expect.any(Object),
        response: { $ne: null },
      });

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: { closedQueries: [{ _id: 'query1', message: 'Resolved' }] },
      });
    });
  });

  describe('openQueryList', () => {
    it('should return openQueries for DRTB role', async () => {
      const instituteId = '507f191e810c19729de860ea';
      const mockRole = { name: 'DRTB' };
      const mockInstitute = { role: mockRole };
      const mockQueries = [
        { _id: 'q1', message: 'Open query', payload: [{ status: 'Open' }] },
      ];

      // Mock institute with role
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInstitute),
      });

      mockQueryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockQueries),
      });

      const result = await service.openQueryList(instituteId);

      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        instituteId,
      );
      expect(mockQueryModel.find).toHaveBeenCalledWith({
        queryRaisedInstitute: expect.any(Object),
        response: null,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: {
          openQueries: [{ _id: 'q1', message: 'Open query' }], // payload should be deleted
        },
      });
    });
  });

  describe('transferQueryList', () => {
    const mockFindByIdWithPopulate = (roleName: string) => ({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ role: { name: roleName } }),
      }),
    });

    // helper to mock findById().select()
    const mockFindByIdWithSelect = (title: string) => ({
      select: jest.fn().mockResolvedValue({ title }),
    });
    it('should return transferQueries and transferRespondedQueries for NODAL role', async () => {
      const instituteId = '507f191e810c19729de860ea';

      // Mock institute with role NODAL
      mockMasterInstituteModel.findById
        .mockImplementationOnce(() => mockFindByIdWithPopulate('NODAL'))
        .mockImplementationOnce(() => mockFindByIdWithSelect('Test Institute'));

      // Mock query data
      const mockQueryData = [
        {
          _id: 'q1',
          payload: [
            {
              queryRespondedInstitute: instituteId,
              status: 'Query Transfer',
            },
          ],
        },
      ];

      // Mock query model for transfer queries
      mockQueryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockQueryData),
      });

      // Call the service method
      const result = await service.transferQueryList(instituteId);

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: {
          transferRespondedQueries: [
            {
              _id: 'q1',
              transferInInstitute: {
                instituteId: '507f191e810c19729de860ea',
                instituteTitle: 'Test Institute',
              },
            },
          ],
        },
      });
    });

    it('should return an empty result if no institute is found', async () => {
      const instituteId = '507f191e810c19729de860ea';

      // Mock the case where the institute is not found
      mockMasterInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue(null),
      });

      await expect(service.transferQueryList(instituteId)).rejects.toThrowError(
        'Institute not found',
      );
    });

    it('should return transferRespondedQueries for non-NODAL role', async () => {
      const instituteId = '507f191e810c19729de860ea';

      // Mock institute with non-NODAL role (for first findById().populate())
      mockMasterInstituteModel.findById
        .mockImplementationOnce(() => mockFindByIdWithPopulate('COE'))
        .mockImplementationOnce(() => mockFindByIdWithSelect('Test Institute'));

      // Mock query data
      const mockQueryData = [
        {
          _id: 'q1',
          payload: [
            {
              queryRespondedInstitute: instituteId,
              status: 'Query Transfer',
            },
          ],
        },
      ];

      // Mock query model for transfer queries
      mockQueryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockQueryData),
      });

      // Call the service method
      const result = await service.transferQueryList(instituteId);

      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: {
          transferRespondedQueries: [
            {
              _id: 'q1',
              transferInInstitute: {
                instituteId,
                instituteTitle: 'Test Institute',
              },
            },
          ],
        },
      });
    });

    it('should handle errors in query fetching and return appropriate error', async () => {
      const instituteId = '507f191e810c19729de860ea';

      // Mock the first .findById().populate() call to succeed (non-NODAL role)
      mockMasterInstituteModel.findById.mockImplementation(() => {
        return {
          populate: jest.fn().mockResolvedValue({ role: { name: 'COE' } }),
        };
      });

      // Mock failure in query fetching
      mockQueryModel.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.transferQueryList(instituteId)).rejects.toThrowError(
        'Database error',
      );
    });
  });

  describe('QueryHistoryOfSubscriber', () => {
    it('should return paginated query history for subscriber', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const mockFilterQuery = { some: 'filter' };
      const mockPaginatedResult = { data: [], total: 0 };

      mockFilterService.filter.mockResolvedValue(mockFilterQuery);
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedResult);

      const result = await service.QueryHistoryOfSubscriber(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockQueryModel,
        paginationDto,
        [
          { path: 'raisedBy', select: 'name' },
          { path: 'respondedBy', select: 'name' },
        ],
        mockFilterQuery,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated query list with full population', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 20,
        fromDate: '',
        toDate: '',
      };
      const mockFilterQuery = { status: 'active' };
      const mockPaginatedResult = { data: ['item1'], total: 1 };

      mockFilterService.filter.mockResolvedValue(mockFilterQuery);
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockQueryModel,
        paginationDto,
        [
          { path: 'raisedBy', select: 'name' },
          { path: 'respondedBy', select: 'name' },
          { path: 'queryRaisedRole', select: 'name' },
          { path: 'queryRespondedRole', select: 'name' },
          { path: 'queryRaisedInstitute', select: 'title' },
          { path: 'queryRespondedInstitute', select: 'title' },
        ],
        mockFilterQuery,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('update', () => {
    it('should update the query and respond correctly', async () => {
      const id = 'query123';
      const updateDto = {
        respondedBy: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        queryRespondedRole: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ),
        queryRespondedInstitute: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ),
        response: 'Some response',
      };

      const existingQuery = { some: 'query data' };
      const updatedQuery = { updated: 'query data' };
      const mockResponse = {
        statusCode: 200,
        data: updatedQuery,
        message: 'Institute updated successfully',
      };

      mockQueryModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(existingQuery),
      });

      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue({}); // mock inc operation
      mockQueryModel.findByIdAndUpdate.mockResolvedValue(updatedQuery);

      const result = await service.update(id, updateDto);

      // Assertions
      expect(mockQueryModel.findById).toHaveBeenCalledWith(id);
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        updateDto.respondedBy,
        { $inc: { 'userContext.queryDetails.querySolved': 1 } },
        { new: true },
      );
      expect(mockQueryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'query123',
        expect.objectContaining({
          $push: { payload: { $each: [existingQuery] } },
          queryRespondedInstitute: expect.any(mongoose.Types.ObjectId),
          queryRespondedRole: expect.any(mongoose.Types.ObjectId),
          respondedBy: expect.any(mongoose.Types.ObjectId),
          response: 'Some response',
          status: 'completed',
        }),
        { new: true },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transferQuery', () => {
    it('should transfer query successfully for admin with DRTB/COE/NODAL role', async () => {
      const mockInstituteId = '6666c830eb18953046b1b56b';
      const mockUserId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );
      const mockRoleId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );
      const mockQueryId = '6666c830eb18953046b1b56b';

      const transferDto = {
        instituteId: mockInstituteId,
        questions: [mockQueryId],
      };

      const userId = {
        _id: mockUserId,
        role: mockRoleId,
      };

      const roleData = { name: 'DRTB' };
      const instituteData = {
        title: 'Test Institute',
        role: '6666c830eb18953046b1b56b',
      };
      const queryData = { _id: mockQueryId, content: 'test query' };
      const subscriberData = { subscriber: '6666c830eb18953046b1b56b' };

      mockMasterInstituteModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(instituteData),
      });

      mockQueryModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(queryData),
      });

      mockRoleModel.findById.mockResolvedValue(roleData);
      mockInstituteModel.findById.mockResolvedValue(subscriberData);

      const updateManyMock = jest.fn().mockResolvedValue({});
      mockQueryModel.updateMany = updateManyMock;

      service.query2CoeNotification = jest.fn().mockResolvedValue({});

      const result = await service.transferQuery(transferDto, userId, 'admin');

      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        mockInstituteId,
      );
      expect(mockQueryModel.findById).toHaveBeenCalledWith(mockQueryId);
      expect(mockRoleModel.findById).toHaveBeenCalledWith(userId.role);
      expect(mockInstituteModel.findById).toHaveBeenCalledWith(userId._id);

      expect(updateManyMock).toHaveBeenCalledWith(
        { _id: { $in: [mockQueryId] } },
        expect.objectContaining({
          $push: { payload: { $each: [queryData] } },
          $set: expect.objectContaining({
            queryRespondedInstitute: expect.any(mongoose.Types.ObjectId),
            queryRespondedRole: expect.any(mongoose.Types.ObjectId),
            transferredBy: expect.any(mongoose.Types.ObjectId),
            status: 'Query Transfer',
          }),
        }),
        { new: true },
      );

      expect(service.query2CoeNotification).toHaveBeenCalledWith(
        expect.anything(),
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Query Transfer Successfully!!',
        data: [],
      });
    });
  });

  describe('upFlowOfQuery', () => {
    it('should update query and notify successfully', async () => {
      const mockQueryId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );
      const mockParentInstitute = { parentId: '6666c830eb18953046b1b56b' };
      const mockRoleOfParent = { role: 'admin' };

      const mockQuery = {
        _id: mockQueryId,
        queryRespondedInstitute: '6666c830eb18953046b1b56b',
        query: 'query1',
        response: 'response1',
        raisedBy: '6666c830eb18953046b1b56b',
        respondedBy: '6666c830eb18953046b1b56b',
        queryRaisedRole: '6666c830eb18953046b1b56b',
        queryRespondedRole: '6666c830eb18953046b1b56b',
        queryRaisedInstitute: '6666c830eb18953046b1b56b',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQueryModel.find.mockResolvedValue([mockQuery]);

      mockMasterInstituteModel.findById
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockParentInstitute),
        }) // for queryRespondedInstitute
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(mockRoleOfParent),
        }); // for parent institute's parentId

      const updateManyMock = jest.fn().mockResolvedValue({});
      mockQueryModel.updateMany = updateManyMock;

      const notificationSpy = jest
        .spyOn(service as any, 'query2CoeNotification')
        .mockResolvedValue(undefined);

      await service.upFlowOfQuery();

      expect(mockQueryModel.find).toHaveBeenCalledWith({
        $or: [
          { updatedAt: { $gte: expect.any(Date) } },
          { createdAt: { $gte: expect.any(Date) } },
        ],
      });

      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );
      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );

      expect(updateManyMock).toHaveBeenCalledWith(
        { _id: { $in: [mockQueryId] } },
        {
          $push: {
            payload: {
              $each: [
                {
                  query: mockQuery.query,
                  response: mockQuery.response,
                  raisedBy: mockQuery.raisedBy,
                  respondedBy: mockQuery.respondedBy,
                  queryRaisedRole: mockQuery.queryRaisedRole,
                  queryRespondedRole: mockQuery.queryRespondedRole,
                  queryRaisedInstitute: mockQuery.queryRaisedInstitute,
                  queryRespondedInstitute: mockQuery.queryRespondedInstitute,
                  status: mockQuery.status,
                },
              ],
            },
          },
          $set: {
            queryRespondedInstitute: '6666c830eb18953046b1b56b',
            queryRespondedRole: 'admin',
          },
        },
        { new: true },
      );

      expect(notificationSpy).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      );
    });
  });

  describe('closeOldQueries', () => {
    it('should close old queries by updating status and pushing to payload', async () => {
      const mockQueryId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );
      const mockOldDate = new Date();
      mockOldDate.setDate(mockOldDate.getDate() - 8); // older than 7 days

      const mockQuery = {
        _id: mockQueryId,
        query: 'test query',
        response: 'test response',
        raisedBy: '6666c830eb18953046b1b56b',
        respondedBy: '6666c830eb18953046b1b56b',
        queryRaisedRole: '6666c830eb18953046b1b56b',
        queryRespondedRole: '6666c830eb18953046b1b56b',
        queryRaisedInstitute: '6666c830eb18953046b1b56b',
        queryRespondedInstitute: '6666c830eb18953046b1b56b',
        status: 'pending',
        updatedAt: mockOldDate,
      };

      const findMock = jest.fn().mockResolvedValue([mockQuery]);
      const updateManyMock = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      mockQueryModel.find = findMock;
      mockQueryModel.updateMany = updateManyMock;

      await service.closeOldQueries();

      expect(findMock).toHaveBeenCalledWith({
        updatedAt: { $lte: expect.any(Date) },
      });

      expect(updateManyMock).toHaveBeenCalledWith(
        { _id: { $in: [mockQueryId] } },
        {
          $push: {
            payload: {
              $each: [
                {
                  query: mockQuery.query,
                  response: mockQuery.response,
                  raisedBy: mockQuery.raisedBy,
                  respondedBy: mockQuery.respondedBy,
                  queryRaisedRole: mockQuery.queryRaisedRole,
                  queryRespondedRole: mockQuery.queryRespondedRole,
                  queryRaisedInstitute: mockQuery.queryRaisedInstitute,
                  queryRespondedInstitute: mockQuery.queryRespondedInstitute,
                  status: mockQuery.status,
                },
              ],
            },
          },
          $set: { status: 'completed' },
        },
        { new: true },
      );
    });
  });

  describe('query2CoeNotification', () => {
    it('should send notification to all subscribers of an institute', async () => {
      const instituteId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );

      const mockSubscribers = [
        {
          _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56c'),
          name: 'User A',
        },
        {
          _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56d'),
          name: 'User B',
        },
      ];

      const mockDeviceTokens = [
        { notificationToken: 'token1' },
        { notificationToken: 'token2' },
      ];

      const mockNotification = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56e'),
        title: 'New Query Raised',
        description:
          'You have a new pending query in your account. Please review and address it at your earliest convenience.',
        link: `${process.env.FRONTEND_URL}/QRMScreen`,
        automaticNotificationType: 'Query 2 COE',
        userId: mockSubscribers.map((s) => s._id),
        createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'),
        status: 'Pending',
        isDeepLink: true,
        typeTitle: 'Query2Coe',
        type: 'Automatic Notification',
      };

      // Mock subscriberModel.find().select().exec()
      mockSubscriberModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockSubscribers),
      });

      // Mock userDeviceTokenModel.find().select().exec()
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDeviceTokens),
      });

      // Mock userNotificationModel.create()
      mockUserNotificationModel.create.mockResolvedValue(mockNotification);

      // Execute service method
      await service.query2CoeNotification(instituteId);

      // Assertions
      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        'userContext.queryDetails.instituteId': instituteId,
      });

      expect(mockUserDeviceTokenModel.find).toHaveBeenCalledWith({
        userId: { $in: mockSubscribers.map((s) => s._id) },
      });

      expect(mockUserNotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Query Raised',
          userId: mockSubscribers.map((s) => s._id),
          automaticNotificationType: 'Query 2 COE',
        }),
      );

      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        mockNotification._id.toString(),
        expect.objectContaining({
          title: 'New Query Raised',
          description: expect.any(String),
          automaticNotificationType: 'Query 2 COE',
          createdBy: expect.any(mongoose.Types.ObjectId),
          isDeepLink: true,
          link: expect.stringContaining('QRMScreen'),
          userId: mockSubscribers.map((s) => s._id),
          status: 'Pending',
          typeTitle: 'Query2Coe',
          type: 'Automatic Notification',
        }),
        mockDeviceTokens,
        'query2coe',
      );
    });
  });

  describe('queryReport', () => {
    it('should return assessment result data', async () => {
      const mockQuery = { 'userId.name': /test/i };

      const mockPaginationDto: any = {
        state: '',
        district: '',
        cadre: '',
        country: '',
      };

      const mockAggregatedData = [{ name: 'Test User', totalMarks: 20 }];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      mockQueryModel.exec.mockResolvedValue(mockAggregatedData);

      const result = await service.queryReport(mockPaginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(
        expect.objectContaining(mockPaginationDto),
      );

      expect(mockQueryModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Query fetch successfully',
        data: mockAggregatedData,
      });
    });
  });
});
