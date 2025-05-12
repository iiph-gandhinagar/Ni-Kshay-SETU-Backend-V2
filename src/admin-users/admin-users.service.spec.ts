jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { paginate } from '../common/pagination/pagination.service';
import { AdminUsersService } from './admin-users.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockAdminUserModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: '1',
      email: 'admin@example.com',
      password: 'hashedPassword',
      firstName: 'Test Admin User',
    }),
  }),
  findById: jest.fn().mockReturnValue({
    exec: jest
      .fn()
      .mockResolvedValue({ _id: '1', firstName: 'Test Admin User' }),
  }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Admin User' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  updateOne: jest.fn(),
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

const mockInstituteModel = {
  findOne: jest.fn().mockReturnThis(),
  populate: jest.fn(),
};

const mockTemporaryTokenModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  findOne: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
};

const mockEmailService = {
  forgotPasswordEmail: jest.fn(),
};
describe('AdminUsersService', () => {
  let service: AdminUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: getModelToken('Institute'), useValue: mockInstituteModel },
        { provide: JwtService, useValue: mockJwtService },

        {
          provide: getModelToken('TemporaryToken'),
          useValue: mockTemporaryTokenModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser ', () => {
    it('should return user if email and password are valid', async () => {
      const mockUser = {
        _id: '1',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Test Admin User',
      };

      mockAdminUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      });

      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await service.validateUser(
        'admin@example.com',
        'plaintextPassword',
      );

      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@example.com',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plaintextPassword',
        'hashedPassword',
      );
      expect(result).toEqual(mockUser);
    });
    it('should return null if user not found', async () => {
      // Mock the findOne method to return null
      mockAdminUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateUser(
        'missing@example.com',
        'anyPassword',
      );

      expect(result).toBeNull();
    });
    it('should return null if password is invalid', async () => {
      const mockUser = {
        _id: '1',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Test Admin User',
      };

      mockAdminUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateUser(
        'admin@example.com',
        'wrongPassword',
      );

      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@example.com',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should login admin user successfully', async () => {
      const mockUser = {
        _id: '1',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        role: 'admin',
      };
      mockAdminUserModel.findOne.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login('admin@example.com', 'plainPassword');

      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@example.com',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toEqual({
        user_details: {
          _id: '1',
          name: 'Admin',
          role: 'admin',
          email: 'admin@example.com',
        },
        access_token: 'mocked-jwt-token',
      });
    });

    it('should login manager user successfully', async () => {
      mockAdminUserModel.findOne.mockResolvedValueOnce(null);
      const mockManager = {
        _id: '2',
        email: 'manager@example.com',
        password: 'hashedPassword',
        role: 'manager',
        instituteId: 'inst123',
        subscriber: 'Manager Name',
      };
      mockInstituteModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockManager),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(
        'manager@example.com',
        'plainPassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toEqual({
        user_details: {
          _id: '2',
          name: 'Manager Name',
          role: 'manager',
          email: 'manager@example.com',
          instituteId: 'inst123',
        },
        access_token: 'mocked-jwt-token',
      });
    });

    it('should return INVALID_CREDENTIALS if no user or manager found', async () => {
      mockAdminUserModel.findOne.mockResolvedValueOnce(null);
      mockInstituteModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await service.login('unknown@example.com', 'anyPassword');

      expect(result).toBeDefined();
      expect(result).toBe('Invalid credentials'); // You can use `message.auth.INVALID_CREDENTIALS` if imported
    });

    it('should return INVALID_CREDENTIALS if admin password is incorrect', async () => {
      const mockUser = {
        _id: '1',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        role: 'admin',
      };
      mockAdminUserModel.findOne.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.login('admin@example.com', 'wrongPassword');

      expect(result).toBe('Invalid credentials');
    });

    it('should return INVALID_CREDENTIALS if manager password is incorrect', async () => {
      mockAdminUserModel.findOne.mockResolvedValueOnce(null);
      const mockManager = {
        _id: '2',
        email: 'manager@example.com',
        password: 'hashedPassword',
        role: 'manager',
        instituteId: 'inst123',
        subscriber: 'Manager Name',
      };
      mockInstituteModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockManager),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.login(
        'manager@example.com',
        'wrongPassword',
      );

      expect(result).toBe('Invalid credentials');
    });
  });

  describe('create', () => {
    it('should hash password, transform IDs, save user, and return response', async () => {
      const createAdminUserDto = {
        email: 'admin@example.com',
        password: 'hashedPassword123',
        role: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        state: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        cadre: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        district: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        firstName: 'admin',
        lastName: 'Admin',
        profileImage: 'Profile Image',
        roleType: 'State_level',
        isAllState: false,
        isAllDistrict: false,
        isAllCadre: false,
        createAdminUserDto: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ),
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedResponse = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAdminUserDto,
        password: hashedPassword,
      };

      mockAdminUserModel.create.mockResolvedValueOnce(expectedResponse);

      const response = await service.create(createAdminUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('hashedPassword123', 10);
      expect(mockAdminUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createAdminUserDto,
          password: hashedPassword,
          role: new mongoose.Types.ObjectId(createAdminUserDto.role),
          countryId: new mongoose.Types.ObjectId(createAdminUserDto.countryId),
          state: [new mongoose.Types.ObjectId(createAdminUserDto.state[0])],
          cadre: [new mongoose.Types.ObjectId(createAdminUserDto.cadre[0])],
          district: [
            new mongoose.Types.ObjectId(createAdminUserDto.district[0]),
          ],
        }),
      );
      expect(response).toEqual({
        statusCode: 200,
        message: 'Admin User created successfully',
        data: expectedResponse,
      });
    });
  });
  describe('findAll', () => {
    it('should return Admin User with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAdminUsers = [{ _id: '1', email: 'admin@example.com' }];
      const mockQuery = { active: true };
      const mockPaginatedResult = {
        items: [{ _id: '1', email: 'admin@example.com' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockAdminUserModel,
        paginationDto,
        expect.any(Array), // populate options
        mockQuery,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin User fetch successfully',
        data: {
          items: mockAdminUsers,
          limit: 10,
          page: 1,
          total: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a Admin User by ID', async () => {
      const mockAdminUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Admin User',
      };
      mockAdminUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockAdminUser),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin User fetch successfully',
        data: mockAdminUser,
      });
      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockAdminUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.findOne(userId)).rejects.toThrowError(
        new HttpException(
          {
            message: 'User Not Found',
            errors: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserProfile', () => {
    it('Should Return admin user profile details', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const mockAdminUser = {
        _id: userId,
        email: 'admin@example.com',
        role: { _id: 'roleId', name: 'Admin' },
        state: [{ _id: 'stateId', title: 'State A' }],
        district: [
          { _id: 'districtId', title: 'District A', stateId: 'stateId' },
        ],
        cadre: [{ _id: 'cadreId', title: 'Cadre A' }],
      };

      mockAdminUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAdminUser),
        }),
      });
      const result = await service.getUserProfile(userId);
      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin User profile successfully', // check your constant here
        data: mockAdminUser,
      });
    });
    it('should throw an error if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockAdminUserModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getUserProfile(userId)).rejects.toThrowError(
        new HttpException(
          {
            message: 'User Not Found',
            errors: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated AdminUser', async () => {
      const updatedAdminUser = { _id: '1', firstName: 'Updated AdminUser' };
      mockAdminUserModel.findByIdAndUpdate.mockResolvedValue(updatedAdminUser);

      const result = await service.update('1', {
        firstName: 'Updated AdminUser',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin User updated successfully',
        data: updatedAdminUser,
      });
      expect(mockAdminUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { firstName: 'Updated AdminUser' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Admin User by ID', async () => {
      mockAdminUserModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockAdminUserModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Admin User deleted successfully',
        data: [],
      });
    });
  });

  describe('forgotEmail', () => {
    it('Should Return reset password into email', async () => {
      mockAdminUserModel.findOne.mockResolvedValue({
        _id: '6666c830eb18953046b1b56b',
        firstName: 'Admin',
        email: 'admin@digiflux.io',
      });

      mockTemporaryTokenModel.create.mockResolvedValue({});
      mockEmailService.forgotPasswordEmail.mockResolvedValue(true);

      const response = await service.forgotEmail('admin@digiflux.io');

      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@digiflux.io',
      });
      expect(mockTemporaryTokenModel.create).toHaveBeenCalledWith({
        name: 'Admin',
        email: 'admin@digiflux.io',
        token: expect.any(String),
        expiredDate: expect.any(Date),
        adminUserId: '6666c830eb18953046b1b56b',
      });
      expect(mockEmailService.forgotPasswordEmail).toHaveBeenCalledWith(
        'admin@digiflux.io',
        expect.any(String),
      );
      expect(response).toEqual({
        statusCode: 200,
        message: 'Link send to your Email Address',
        data: [],
      });
    });
  });

  describe('verifiedToken', () => {
    const tokenVerificationDto = {
      email: 'admin@digiflux.io',
      password: 'hashedPassword123',
      token: 'mockedToken123',
    };
    it('should successfully verify token and update password', async () => {
      const futureDate = new Date();

      futureDate.setDate(futureDate.getDate() + 1);

      const mockTokenDoc = {
        expiredDate: futureDate,
        adminUserId: '6666c830eb18953046b1b56b',
      };

      mockTemporaryTokenModel.findOne.mockResolvedValue(mockTokenDoc);
      mockAdminUserModel.updateOne.mockResolvedValue({});

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.verifiedToken(tokenVerificationDto);

      expect(mockTemporaryTokenModel.findOne).toHaveBeenCalledWith({
        email: 'admin@digiflux.io',
        token: 'mockedToken123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('hashedPassword123', 10);

      expect(mockAdminUserModel.updateOne).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId(mockTokenDoc.adminUserId) },
        { password: 'hashedPassword123' },
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Password changed Successfully!',
        data: [],
      });
    });

    it('should throw error if token not found', async () => {
      mockTemporaryTokenModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.verifiedToken(tokenVerificationDto)).rejects.toThrow(
        'token Not Found',
      );

      expect(mockTemporaryTokenModel.findOne).toHaveBeenCalledWith({
        email: 'admin@digiflux.io',
        token: 'mockedToken123',
      });
    });

    it('should throw error if token is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // already expired

      mockTemporaryTokenModel.findOne = jest.fn().mockResolvedValue({
        expiredDate,
        adminUserId: '6666c830eb18953046b1b56b',
      });

      await expect(service.verifiedToken(tokenVerificationDto)).rejects.toThrow(
        'token Expired!',
      );
    });
  });
});
