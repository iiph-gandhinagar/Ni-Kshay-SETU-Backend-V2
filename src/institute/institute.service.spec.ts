jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { TransferManagerDto } from './dto/transfer-manager.dto';
import { InstituteService } from './institute.service';

jest.mock('crypto', () => {
  const originalCrypto = jest.requireActual('crypto');
  return {
    ...originalCrypto,
    randomBytes: jest
      .fn()
      .mockReturnValue(Buffer.from('mockedpassword123', 'utf-8')),
  };
});

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockInstituteModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Institute' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Institute' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  updateOne: jest.fn().mockResolvedValue({}),
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
  sendPassword: jest.fn(),
  sendWelcomeMember: jest.fn(),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateMany: jest.fn(),
  find: jest.fn(),
};

const mockQueryModel = {
  findOne: jest.fn(),
};

const mockRoleModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
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
describe('InstituteService', () => {
  let service: InstituteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstituteService,
        { provide: getModelToken('Query'), useValue: mockQueryModel },
        { provide: getModelToken('Institute'), useValue: mockInstituteModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        {
          provide: getModelToken('MasterInstitute'),
          useValue: mockMasterInstituteModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<InstituteService>(InstituteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createInstituteDto = {
      id: 1,
      instituteId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      role: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      subscriber: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'), // Ensure this matches the mock
      email: 'email@digiflux.io',
      password: '123456',
      createdBy: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      createdByInstitute: new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      ),
    };
    const userId = new mongoose.Types.ObjectId(
      '6666c830eb18953046b1b56b',
    ).toString();

    const mockInstitute = {
      _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      ...createInstituteDto,
    };
    const mockSubscriber = {
      phoneNo: '1234567890',
      userContext: {
        queryDetails: {
          instituteId: null,
        },
      },
      email: 'test@example.com',
      name: 'Test User',
    };

    const roleId = new mongoose.Types.ObjectId(
      '6666c830eb18953046b1b56b',
    ).toString();

    it('should successfully create an institute (Admin role)', async () => {
      // Mock dependencies
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockSubscriber),
      });

      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          name: 'Admin',
        }),
      });
      mockInstituteModel.create.mockResolvedValue(mockInstitute);

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.create(
        createInstituteDto,
        '6666c830eb18953046b1b56b',
        roleId,
      );

      // Assertions
      expect(mockInstituteModel.findOne).toHaveBeenCalledWith({
        instituteId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      });
      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      );
      expect(mockRoleModel.findById).toHaveBeenCalledWith(roleId);
      expect(mockInstituteModel.create).toHaveBeenCalledWith(
        createInstituteDto,
      );
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockEmailService.sendPassword).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute Created successfully',
        data: mockInstitute,
      });
    });

    it('should throw error when institute already exists', async () => {
      mockInstituteModel.findOne.mockResolvedValue({
        instituteId: 'existingId',
      });

      await expect(
        service.create(createInstituteDto, userId, roleId),
      ).rejects.toThrowError(
        new HttpException(
          {
            message: [{ instituteId: 'Manager has already been added!' }],
            errors: 'Manager has already been added!',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error when subscriber not found', async () => {
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null), // this simulates "not found"
      });

      await expect(
        service.create(createInstituteDto, userId, roleId),
      ).rejects.toThrowError(
        new HttpException(
          { message: 'Subscriber not found', errors: 'Subscriber not found' },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw error when subscriber already assigned to institute', async () => {
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          phoneNo: '1234567890',
          email: 'test@example.com',
          name: 'John Doe',
          userContext: {
            queryDetails: {
              instituteId: new mongoose.Types.ObjectId(
                '6666c830eb18953046b1b56b',
              ), // subscriber already assigned
            },
          },
        }),
      });

      await expect(
        service.create(createInstituteDto, userId, roleId),
      ).rejects.toThrowError(
        new HttpException(
          'Member is already assigned to another institute.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should set createdByInstitute for non-admin roles', async () => {
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockSubscriber),
      });
      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          name: 'Manager',
        }),
      });

      const result = await service.create(
        createInstituteDto,
        '6666c830eb18953046b1b56b',
        roleId,
      );

      expect(mockInstituteModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdByInstitute: new mongoose.Types.ObjectId(userId),
        }),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute Created successfully',
        data: mockInstitute,
      });
    });

    it('should generate and hash password correctly', async () => {
      // Mock dependencies
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockSubscriber),
      });
      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          name: 'Admin',
        }),
      });

      const mockHash = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword');

      await service.create(
        createInstituteDto,
        '68107a76ce508c2160cb455f',
        roleId,
      );

      // Verify password generation
      expect(mockHash).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-zA-Z0-9]{12}$/),
        10,
      );
    });

    it('should send email with generated password', async () => {
      // Mock dependencies
      mockInstituteModel.findOne.mockResolvedValue(null);
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockSubscriber),
      });

      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          name: 'Admin',
        }),
      });
      const mockPassword = 'bW9ja2VkcGFz';
      const hashedPassword = await bcrypt.hash(mockPassword, 10); // Hash the mock password
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      await service.create(createInstituteDto, userId, roleId);

      expect(mockEmailService.sendPassword).toHaveBeenCalledWith(
        createInstituteDto.email,
        'Test User',
        'bW9ja2VkcGFz',
      );
    });
  });

  describe('findAll', () => {
    it('should paginate institutes with proper query filters for COE/NODAL/DRTB roles', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const user = {
        _id: '605c72ef2f1f2c23b8a64f44',
        instituteId: '605c72ef2f1f2c23b8a64f45',
        role: '605c72ef2f1f2c23b8a64f46',
      };
      const mockInstitute = [
        { name: 'Institute Algo 1' },
        { name: 'Institute Algo 2' },
      ];

      const mockRoleName = { name: 'COE' }; // Could be COE, NODAL, or DRTB
      const mockQuery = {};

      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockRoleName),
      });

      mockFilterService.filter.mockResolvedValue(mockQuery);

      (paginate as jest.Mock).mockResolvedValue(mockInstitute);

      const result = await service.findAll(paginationDto, user);

      expect(mockRoleModel.findById).toHaveBeenCalledWith(user.role);
      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockInstituteModel,
        paginationDto,
        [
          { path: 'role', select: 'name' }, // Populate Role and select only the name field
          { path: 'subscriber', select: 'name' }, // Populate Subscriber and select only the name field
          { path: 'instituteId', select: 'title' },
        ],
        mockQuery,
      );
      expect(result).toEqual(mockInstitute);
    });
  });

  describe('findOne', () => {
    const mockInstituteId = '605c72ef2f1f2c23b8a64f44';
    const mockInstitute = {
      _id: 'newInstituteId',
    };
    it('should return a institute by ID', async () => {
      mockInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockInstitute),
        }),
      });

      const result = await service.findOne('605c72ef2f1f2c23b8a64f44');
      expect(mockInstituteModel.findById).toHaveBeenCalledWith(mockInstituteId);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute fetch successfully',
        data: {
          _id: 'newInstituteId',
        },
      });
    });

    it('should return null if institute not found', async () => {
      mockInstituteModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.findOne('605c72ef2f1f2c23b8a64f44');
      expect(mockInstituteModel.findById).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    const mockInstituteId = '605c72ef2f1f2c23b8a64f44';
    const mockSubscriberId = '507f191e810c19729de860ea';

    const updateInstituteDto = {
      subscriber: new mongoose.Types.ObjectId(mockSubscriberId),
      email: 'manager@example.com',
    };

    const updatedInstitute = {
      _id: 'newInstituteId',
    };

    const mockUser = {
      name: 'Jane Doe',
    };
    it('should update institute and send email if subscriber/email present', async () => {
      // Arrange: Mock the necessary data and responses
      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockEmailService.sendPassword.mockResolvedValue({});
      mockInstituteModel.findByIdAndUpdate.mockResolvedValue(updatedInstitute);

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Act: Call the update method
      const result = await service.update(mockInstituteId, updateInstituteDto);

      // Assert: Check the expectations
      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(mockSubscriberId),
      );
      expect(mockEmailService.sendPassword).toHaveBeenCalledWith(
        updateInstituteDto.email,
        mockUser.name,
        'bW9ja2VkcG', // The mocked random string
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('bW9ja2VkcG', 10);
      expect(mockInstituteModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInstituteId,
        expect.objectContaining({ password: 'hashedPassword123' }),
        { new: true },
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute updated successfully',
        data: updatedInstitute,
      });
    });

    it('should update institute without email/password if subscriber/email not provided', async () => {
      // Arrange: Provide empty DTO without subscriber/email
      const updateInstituteDtoWithoutSensitiveFields = {};
      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockInstituteModel.findByIdAndUpdate.mockResolvedValue(updatedInstitute);

      // Act: Call the update method
      const result = await service.update(
        mockInstituteId,
        updateInstituteDtoWithoutSensitiveFields,
      );

      // Assert: Check that no email/password related functions are called
      expect(mockInstituteModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockInstituteId,
        updateInstituteDtoWithoutSensitiveFields,
        { new: true },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute updated successfully',
        data: updatedInstitute,
      });
    });

    it('should throw error if subscriber is not found', async () => {
      // Arrange: Mock that the subscriber is not found
      mockSubscriberModel.findById.mockResolvedValue(null);

      // Act & Assert: Call the update method and expect an error
      await expect(
        service.update(mockInstituteId, updateInstituteDto),
      ).rejects.toThrowError(
        new HttpException('Subscriber not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should throw an error if there are queries linked to the institute', async () => {
      mockQueryModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ query: 'Some Query' }),
      });

      await expect(
        service.remove('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        response: {
          errors: 'Please transfer your queries to another institute',
        },
      });
    });

    it('should unset instituteId from subscribers and delete the institute', async () => {
      // No queries found, so deletion should proceed
      mockQueryModel.findOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      const mockInstitute = { instituteId: 'INST123' };
      mockInstituteModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockInstitute),
      });

      mockSubscriberModel.updateMany.mockResolvedValue({ acknowledged: true });

      mockInstituteModel.findByIdAndDelete.mockResolvedValue({
        acknowledged: true,
      });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(mockQueryModel.findOne).toHaveBeenCalledWith({
        queryRespondedInstitute: new mongoose.Types.ObjectId(
          '507f1f77bcf86cd799439011',
        ),
      });

      expect(mockInstituteModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockSubscriberModel.updateMany).toHaveBeenCalledWith(
        { 'userContext.queryDetails.instituteId': mockInstitute.instituteId },
        {
          $unset: {
            'userContext.queryDetails.instituteId': '',
            'userContext.queryDetails.type': '',
          },
        },
        { new: true },
      );

      expect(mockInstituteModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute deleted successfully',
        data: [],
      });
    });
  });

  describe('addMember', () => {
    const mockDto = {
      instituteId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
      instituteRole: 'COORDINATOR',
      subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
      isActive: true,
    };

    const mockUser = {
      _id: mockDto.subscriberId,
      email: 'user@example.com',
      name: 'John Doe',
      phoneNo: '1234567890',
      userContext: {
        queryDetails: {
          instituteId: null,
          type: null,
          querySolved: 0,
          isActive: false,
        },
      },
    };

    const updatedSubscriber = {
      ...mockUser,
      userContext: {
        queryDetails: {
          instituteId: mockDto.instituteId,
          type: mockDto.instituteRole,
          querySolved: 0,
          isActive: mockDto.isActive,
        },
      },
    };

    const mockInstitute = { _id: mockDto.instituteId, title: 'Test Institute' };
    it('should throw 404 if subscriber not found', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addMember(mockDto)).rejects.toThrow(
        'Member Not Found!!',
      );
    });

    it('should throw 400 if member already assigned to another institute', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          userContext: {
            queryDetails: {
              instituteId: 'existingInstitute',
            },
          },
        }),
      });

      await expect(service.addMember(mockDto)).rejects.toThrowError(
        new HttpException(
          {
            message: [
              { query: 'Member is already assigned to another institute.' },
            ],
            subscriberId: 'Member is already assigned to another institute.',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should update subscriber and send welcome email', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue(
        updatedSubscriber,
      );

      mockMasterInstituteModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockInstitute),
      });

      mockEmailService.sendWelcomeMember.mockResolvedValue(undefined);

      const result = await service.addMember(mockDto);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        mockDto.subscriberId,
      );
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockDto.subscriberId,
        {
          $set: {
            'userContext.queryDetails.instituteId': mockDto.instituteId,
            'userContext.queryDetails.type': mockDto.instituteRole,
            'userContext.queryDetails.querySolved': 0,
            'userContext.queryDetails.isActive': mockDto.isActive,
          },
        },
        { new: true, upsert: true },
      );

      expect(mockEmailService.sendWelcomeMember).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        mockInstitute.title,
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Member added successfully',
        data: updatedSubscriber,
      });
    });

    it('should catch and return error if something fails', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      mockSubscriberModel.findByIdAndUpdate.mockRejectedValueOnce(
        new Error('DB failure'),
      );

      const result = await service.addMember(mockDto);

      expect(result).toEqual({
        status: false,
        message: '❌ Error in Updating Subscriber Data in Add Member:',
        error: expect.any(Error),
      });
    });
  });

  describe('getMembersOfInstitute', () => {
    const mockMembers = [
      {
        _id: 'memberId1',
        email: 'member1@example.com',
        name: 'Alice',
        phoneNo: '1234567890',
        userContext: {
          queryDetails: {
            instituteId: { _id: 'inst1', title: 'Test Institute' },
            type: { _id: 'type1', name: 'Manager' },
          },
        },
        cadreId: { title: 'Health Worker' },
      },
    ];
    it('should return list of members for an institute', async () => {
      const instituteId = 'inst1';
      mockSubscriberModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockMembers),
        }),
      });
      const result = await service.getMembersOfInstitute(instituteId);

      expect(mockSubscriberModel.find).toHaveBeenCalledWith({
        'userContext.queryDetails.instituteId': instituteId,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Institute Member Fetch successfully',
        data: [
          {
            _id: 'memberId1',
            cadreId: {
              title: 'Health Worker',
            },
            email: 'member1@example.com',
            name: 'Alice',
            phoneNo: '1234567890',
            userContext: {
              queryDetails: {
                instituteId: {
                  _id: 'inst1',
                  title: 'Test Institute',
                },
                type: {
                  _id: 'type1',
                  name: 'Manager',
                },
              },
            },
          },
        ],
      });
    });
  });

  describe('deleteMember', () => {
    const deleteMemberDto = {
      subscriberId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
      instituteId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
    };
    it('Should Delete member from institute', async () => {
      mockSubscriberModel.findByIdAndUpdate.mockReturnValue({
        _id: 'newSubscriber',
      });
      const result = await service.deleteMember(deleteMemberDto);
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        {
          $unset: {
            'userContext.queryDetails.instituteId': '',
            'userContext.queryDetails.type': '',
          },
        },
        { new: true },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Member Deleted Successfully!',
        data: [],
      });
    });
  });

  describe('transferManager', () => {
    it('should successfully transfer manager and send password email', async () => {
      const mockDto: TransferManagerDto = {
        subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
        email: 'manager@example.com',
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        subscriber: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        password: 'hashedPassword123',
      };

      const mockUser = {
        name: 'Jane Doe',
        userContext: {
          queryDetails: {
            instituteId: null,
          },
        },
      };

      const mockInstituteRole = {
        role: '609e127e8a1b2c6f88f5b5c8',
      };

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockInstituteModel.updateOne.mockResolvedValue({ acknowledged: true });
      mockInstituteModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockInstituteRole),
      });
      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue({});
      mockEmailService.sendPassword.mockResolvedValue({});

      const result = await service.transferManager(
        '609e127e8a1b2c6f88f5b5c8',
        mockDto,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        mockDto.subscriberId,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('bW9ja2VkcG', 10);
      expect(mockInstituteModel.updateOne).toHaveBeenCalled();
      expect(mockInstituteModel.findOne).toHaveBeenCalledWith({
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
      });
      expect(mockSubscriberModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockEmailService.sendPassword).toHaveBeenCalledWith(
        mockDto.email,
        mockUser.name,
        'bW9ja2VkcG',
      );

      expect(result).toEqual({
        statusCode: 200,
        message: 'Transfer manager successfully',
        data: [],
      });
    });

    it('should throw an error if the user is already assigned to another institute', async () => {
      const mockDto: TransferManagerDto = {
        subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
        email: 'manager@example.com',
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        subscriber: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        password: 'hashedPassword123',
      };

      const mockUser = {
        name: 'Jane Doe',
        userContext: {
          queryDetails: {
            instituteId: new mongoose.Types.ObjectId(
              '609e127e8a1b2c6f88f5b5c8',
            ),
          },
        },
      };

      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      const result = await service.transferManager(
        '609e127e8a1b2c6f88f5b5c8',
        mockDto,
      );

      expect(result).toEqual({
        status: false,
        message: 'Error Updating Institute manager Data (transfer Query)',
        error: expect.any(HttpException),
      });
    });

    it('should throw an error if the subscriber is not found', async () => {
      const mockDto: TransferManagerDto = {
        subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
        email: 'manager@example.com',
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        subscriber: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        password: 'hashedPassword123',
      };

      mockSubscriberModel.findById.mockResolvedValue(null);
      const result = await service.transferManager(
        '609e127e8a1b2c6f88f5b5c8',
        mockDto,
      );

      expect(result).toEqual({
        status: false,
        message: 'Error Updating Institute manager Data (transfer Query)',
        error: expect.any(HttpException),
      });
    });

    it('should throw an error if the institute role is not found', async () => {
      const mockDto: TransferManagerDto = {
        subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
        email: 'manager@example.com',
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        subscriber: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        password: 'hashedPassword123',
      };

      const mockUser = {
        name: 'Jane Doe',
        userContext: {
          queryDetails: {
            instituteId: new mongoose.Types.ObjectId(
              '609e127e8a1b2c6f88f5b5c8',
            ),
          },
        },
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123');
      mockSubscriberModel.findById.mockResolvedValue(mockUser);
      mockInstituteModel.updateOne.mockResolvedValue({});
      mockInstituteModel.findOne.mockResolvedValue(null); // Simulate no role found
      const result = await service.transferManager('adminUser Id', mockDto);

      expect(result).toEqual({
        status: false,
        message: 'Error Updating Institute manager Data (transfer Query)',
        error: expect.any(HttpException),
      });
    });

    it('should handle errors during password hashing', async () => {
      const mockDto: TransferManagerDto = {
        subscriberId: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
        email: 'manager@example.com',
        instituteId: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        subscriber: new mongoose.Types.ObjectId('609e127e8a1b2c6f88f5b5c8'),
        password: '',
      };

      const mockUser = {
        name: 'Jane Doe',
        userContext: {
          queryDetails: {
            instituteId: new mongoose.Types.ObjectId(
              '609e127e8a1b2c6f88f5b5c8',
            ),
          },
        },
      };

      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing error'));
      mockSubscriberModel.findById.mockResolvedValue(mockUser);

      const result = await service.transferManager('adminUser Id', mockDto);

      expect(result).toEqual({
        status: false,
        message: 'Error Updating Institute manager Data (transfer Query)',
        error: expect.any(HttpException),
      });
    });
  });
});
