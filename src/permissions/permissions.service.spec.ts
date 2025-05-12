import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PermissionsService } from './permissions.service';

const mockPermissionModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Permission' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Permission' }),
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

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getModelToken('Permission'), useValue: mockPermissionModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Permission', async () => {
      const createPermissionDto = {
        id: 1,
        name: 'Permissions',
        description: 'Admin Permission',
        moduleName: 'Admin',
        isActive: false,
      };
      const mockPermission = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createPermissionDto,
      };
      mockPermissionModel.create.mockResolvedValue(mockPermission);

      const result = await service.create(createPermissionDto);
      expect(mockPermissionModel.create).toHaveBeenCalledWith(
        createPermissionDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission created successfully',
        data: mockPermission,
      });
    });
  });

  describe('findAll', () => {
    it('should return permission with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockPermissions = [
        { name: 'Permission 1' },
        { name: 'Permission 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPermissions),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockPermissionModel.find.mockReturnValue(mockQuery);
      mockPermissionModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockPermissions,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockPermissionModel.find).toHaveBeenCalled();
      expect(mockPermissionModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Permission by ID', async () => {
      const mockPermission = { _id: '1', name: 'Test Permission' };
      mockPermissionModel.findById.mockReturnValue(mockPermission);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission fetch successfully',
        data: mockPermission,
      });
      expect(mockPermissionModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Permission not found', async () => {
      mockPermissionModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Permission', async () => {
      const updatedPermissionI = { _id: '1', title: 'Updated Permission' };
      mockPermissionModel.findByIdAndUpdate.mockResolvedValue(
        updatedPermissionI,
      );

      const result = await service.update('1', { name: 'Updated Permission' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission updated successfully',
        data: updatedPermissionI,
      });
      expect(mockPermissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Permission' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a block by ID', async () => {
      mockPermissionModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockPermissionModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission deleted successfully',
        data: [],
      });
    });
  });

  describe('findAllPermission', () => {
    it('should return all Permissions', async () => {
      const mockPermissions = [
        { _id: 1, name: 'Test Permission', isActive: true },
      ];
      mockPermissionModel.find.mockResolvedValueOnce(mockPermissions);

      const result = await service.findAllPermission();

      expect(mockPermissionModel.find).toHaveBeenCalledWith();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Permission fetch successfully',
        data: mockPermissions,
      });
    });
  });
});
