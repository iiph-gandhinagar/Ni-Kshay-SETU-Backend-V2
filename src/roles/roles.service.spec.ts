import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { RolesService } from './roles.service';

const mockRoleModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Role' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Role' }),
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
const mockAdminUserModel = {
  findOne: jest.fn(),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Role', async () => {
      const createRoleDto = {
        id: 1,
        name: 'role',
        description: 'Permissions',
        permission: ['permission'],
      };
      const mockRole = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createRoleDto,
      };
      mockRoleModel.create.mockResolvedValue(mockRole);

      const result = await service.create(createRoleDto);
      expect(mockRoleModel.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Role created successfully',
        data: mockRole,
      });
    });
  });

  describe('findAll', () => {
    it('should return Role with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockRoles = [{ name: 'Role 1' }, { name: 'Role 2' }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRoles),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockRoleModel.find.mockReturnValue(mockQuery);
      mockRoleModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockRoles,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockRoleModel.find).toHaveBeenCalled();
      expect(mockRoleModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Role by ID', async () => {
      const mockRole = { _id: '1', name: 'Test Role' };
      mockRoleModel.findById.mockReturnValue(mockRole);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Role fetch successfully',
        data: mockRole,
      });
      expect(mockRoleModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Role not found', async () => {
      mockRoleModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Role fetch successfully',
        data: null,
      });
    });
  });

  describe('findAllRole', () => {
    it('should return all Role', async () => {
      const mockRole = [{ _id: '1', name: 'Test Role' }];
      mockRoleModel.find.mockReturnValue(mockRole);

      const result = await service.findAllRole();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Role fetch successfully',
        data: mockRole,
      });
      expect(mockRoleModel.find).toHaveBeenCalledWith();
    });
  });

  describe('update', () => {
    it('should update and return the updated Role', async () => {
      const updatedRole = { _id: '1', name: 'Updated Role' };
      mockRoleModel.findByIdAndUpdate.mockResolvedValue(updatedRole);

      const result = await service.update('1', { name: 'Updated Role' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Role updated successfully',
        data: updatedRole,
      });
      expect(mockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Role' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if Role is linked to a subscriber', async () => {
      mockAdminUserModel.findOne.mockResolvedValueOnce({});

      await expect(service.remove('1')).rejects.toThrow(HttpException);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        role: '1',
      });
    });

    it('should delete a Role by ID if not linked to a subscriber', async () => {
      mockAdminUserModel.findOne.mockResolvedValueOnce(null);
      mockRoleModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockRoleModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Role deleted successfully',
        data: [],
      });
    });
  });
});
