import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { paginate } from '../common/pagination/pagination.service';
import { MasterInstituteService } from './master-institute.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));
const mockMasterInstituteModel = {
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
  aggregate: jest.fn(),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};
const mockSubscriberModel = {
  findOne: jest.fn(),
  updateMany: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockRoleModel = {
  findById: jest.fn(),
};

const mockInstituteModel = {
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
describe('MasterInstituteService', () => {
  let service: MasterInstituteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterInstituteService,
        {
          provide: getModelToken('MasterInstitute'),
          useValue: mockMasterInstituteModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('Institute'), useValue: mockInstituteModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<MasterInstituteService>(MasterInstituteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Master-institute', async () => {
      const createMasterInstituteDto = {
        id: 1,
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        districtId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: 'Master-institute',
        role: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        parentId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        createdBy: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      };
      const mockMasterInstitute = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createMasterInstituteDto,
      };
      mockMasterInstituteModel.create.mockResolvedValue(mockMasterInstitute);

      const result = await service.create(
        createMasterInstituteDto,
        '6666c830eb18953046b1b56b',
      );
      expect(mockMasterInstituteModel.create).toHaveBeenCalledWith(
        createMasterInstituteDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute Created successfully',
        data: mockMasterInstitute,
      });
    });
  });

  describe('findInstitute', () => {
    it('should return list of COE and NODAL institutes', async () => {
      const mockInstitutes = [
        {
          _id: 'institute1',
          role: 'role1',
          title: 'Institute A',
          typeDetails: {
            _id: 'role1',
            name: 'COE',
          },
        },
        {
          _id: 'institute2',
          role: 'role2',
          title: 'Institute B',
          typeDetails: {
            _id: 'role2',
            name: 'NODAL',
          },
        },
      ];

      mockMasterInstituteModel.aggregate.mockResolvedValue(mockInstitutes);

      const result = await service.findInstitute();

      expect(mockMasterInstituteModel.aggregate).toHaveBeenCalledWith([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'typeDetails',
          },
        },
        {
          $unwind: '$typeDetails',
        },
        {
          $match: {
            $or: [
              { 'typeDetails.name': 'COE' },
              { 'typeDetails.name': 'NODAL' },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            title: 1,
            typeDetails: 1,
          },
        },
      ]);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: mockInstitutes,
      });
    });
  });

  describe('findAll', () => {
    it('should call filterService.filter and paginate with correct arguments', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = { some: 'query' };
      const mockMasterInstitute = [
        { name: 'Master Institute Algo 1' },
        { name: 'Master Institute Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockMasterInstitute);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockMasterInstituteModel,
        paginationDto,
        [{ path: 'parentId', select: 'title role' }],
        mockQuery,
      );
      expect(result).toEqual(mockMasterInstitute);
    });
  });
  describe('findOne', () => {
    it('should return a Master Institute by ID', async () => {
      const mockMasterInstitute = { _id: '1', title: 'Test Master Institute' };
      mockMasterInstituteModel.findById.mockResolvedValue(mockMasterInstitute);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: mockMasterInstitute,
      });
      expect(mockMasterInstituteModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Master Institute not found', async () => {
      mockMasterInstituteModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Master-Institute', async () => {
      const updatedMasterInstitute = {
        _id: '1',
        title: 'Updated Master-Institute',
      };
      mockMasterInstituteModel.findByIdAndUpdate.mockResolvedValue(
        updatedMasterInstitute,
      );

      const result = await service.update('1', {
        title: 'Updated Master-Institute',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute updated successfully',
        data: updatedMasterInstitute,
      });
      expect(mockMasterInstituteModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Master-Institute' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should unset instituteId/type in subscriber and delete master institute', async () => {
      mockSubscriberModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      mockMasterInstituteModel.findByIdAndDelete.mockResolvedValue({
        _id: '1',
      });

      const response = await service.remove('1');

      expect(mockSubscriberModel.updateMany).toHaveBeenCalledWith(
        { 'userContext.queryDetails.instituteId': '1' },
        {
          $unset: {
            'userContext.queryDetails.instituteId': '',
            'userContext.queryDetails.type': '',
          },
        },
        { new: true },
      );

      expect(mockMasterInstituteModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );

      expect(response).toEqual({
        statusCode: 200,
        message: 'Master Institute deleted successfully',
        data: [],
      });
    });
  });

  describe('parentInstitute', () => {
    it('should return parent institutes when role is NODAL', async () => {
      const mockRole = { _id: '6666c830eb18953046b1b56b', name: 'NODAL' };
      const mockParents = [
        { _id: '1', title: 'COE Parent', role: '6666c830eb18953046b1b56b' },
      ];

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      mockMasterInstituteModel.aggregate.mockResolvedValueOnce(mockParents);

      const result = await service.parentInstitute('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: mockParents,
      });

      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );
      expect(mockMasterInstituteModel.aggregate).toHaveBeenCalled();
    });

    it('should return parent institutes when role is DRTB', async () => {
      const mockRole = { _id: '6666c830eb18953046b1b56b', name: 'DRTB' };
      const mockParents = [
        { _id: '2', title: 'NODAL Parent', role: '6666c830eb18953046b1b56b' },
      ];

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      mockMasterInstituteModel.aggregate.mockResolvedValueOnce(mockParents);

      const result = await service.parentInstitute('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: mockParents,
      });

      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );
      expect(mockMasterInstituteModel.aggregate).toHaveBeenCalled();
    });

    it('should throw error if role not found', async () => {
      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.parentInstitute('6666c830eb18953046b1b56b'),
      ).rejects.toThrow(
        new HttpException(
          {
            message: { Role: 'Role Not Found!!' },
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockRoleModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );
    });

    it('should return empty array if role name is not NODAL or DRTB', async () => {
      const mockRole = { _id: '6666c830eb18953046b1b56b', name: 'OTHER' };

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      const result = await service.parentInstitute('6666c830eb18953046b1b56b');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Institute fetch successfully',
        data: [],
      });
    });
  });

  describe('instituteList', () => {
    const mockTypeId = 'type123';
    const mockManagerId = 'manager123';

    it('should return child institutes for master institute manager', async () => {
      const mockRole = { _id: mockTypeId, name: 'DRTB' };
      const mockInstitute = { _id: mockManagerId, instituteId: 'parentId123' };
      const mockResult = [{ _id: 'inst1', title: 'Child Institute' }];

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      mockInstituteModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockInstitute),
      });

      mockMasterInstituteModel.aggregate.mockResolvedValueOnce(mockResult);

      const result = await service.instituteList(mockTypeId, mockManagerId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Parent Institute Fetch Successfully',
        data: mockResult,
      });

      expect(mockRoleModel.findById).toHaveBeenCalledWith(mockTypeId);
      expect(mockMasterInstituteModel.aggregate).toHaveBeenCalled();
    });

    it('should return institute list if manager is Admin user', async () => {
      const mockRole = { _id: mockTypeId, name: 'COE' };
      const mockAdminUser = {
        _id: mockManagerId,
        role: { name: 'Admin' },
      };
      const mockResult = [{ _id: 'inst2', title: 'Institute for Admin' }];

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      mockInstituteModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      mockAdminUserModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockAdminUser),
        }),
      });

      mockMasterInstituteModel.aggregate.mockResolvedValueOnce(mockResult);

      const result = await service.instituteList(mockTypeId, mockManagerId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Parent Institute Fetch Successfully',
        data: mockResult,
      });

      expect(mockRoleModel.findById).toHaveBeenCalledWith(mockTypeId);
      expect(mockMasterInstituteModel.aggregate).toHaveBeenCalled();
    });

    it('should return empty list if instituteId and adminUser are not found', async () => {
      const mockRole = { _id: mockTypeId, name: 'COE' };

      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockRole),
      });

      mockInstituteModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      mockAdminUserModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.instituteList(mockTypeId, mockManagerId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Parent Institute Fetch Successfully',
        data: undefined, // because `instituteList` stays undefined in this case
      });

      expect(mockMasterInstituteModel.aggregate).not.toHaveBeenCalled();
    });

    it('should throw HttpException when role not found', async () => {
      mockRoleModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.instituteList(mockTypeId, mockManagerId),
      ).rejects.toThrow(
        new HttpException(
          {
            message: { Role: 'Role Not Found!!' },
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockRoleModel.findById).toHaveBeenCalledWith(mockTypeId);
    });
  });
});
