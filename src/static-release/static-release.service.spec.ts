import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticReleaseService } from './static-release.service';

const mockStaticReleaseModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Static Release' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static Release' }),
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
describe('StaticReleaseService', () => {
  let service: StaticReleaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticReleaseService,
        {
          provide: getModelToken('StaticRelease'),
          useValue: mockStaticReleaseModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticReleaseService>(StaticReleaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Static Release', async () => {
      const createStaticReleaseDto = {
        id: 1,
        feature: [{ en: 'feature' }],
        bugFix: [{ en: 'bug Fix' }],
        date: new Date(),
        orderIndex: 1,
        active: false,
      };
      const mockStaticRelease = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticReleaseDto,
      };
      mockStaticReleaseModel.create.mockResolvedValue(mockStaticRelease);

      const result = await service.create(createStaticReleaseDto);
      console.log('result--->', result);
      expect(mockStaticReleaseModel.create).toHaveBeenCalledWith(
        createStaticReleaseDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static release Created successfully',
        data: mockStaticRelease,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static release with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticReleases = [
        { feature: { en: 'Static release 1' } },
        { feature: { en: 'Static release 2' } },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticReleases),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticReleaseModel.find.mockReturnValue(mockQuery);
      mockStaticReleaseModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'mockUserId');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticReleases,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticReleaseModel.find).toHaveBeenCalled();
      expect(mockStaticReleaseModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findAllReleases', () => {
    it('should return Static release with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticReleases = [
        { feature: { en: 'Static release 1' } },
        { feature: { en: 'Static release 2' } },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticReleases),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticReleaseModel.find.mockReturnValue(mockQuery);
      mockStaticReleaseModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAllReleases(paginationDto, 'en');

      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticReleases,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticReleaseModel.find).toHaveBeenCalled();
      expect(mockStaticReleaseModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Static release by ID', async () => {
      const mockStaticRelease = { _id: '1', feature: 'Test Static release' };
      mockStaticReleaseModel.findById.mockReturnValue(mockStaticRelease);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static release fetch successfully',
        data: mockStaticRelease,
      });
      expect(mockStaticReleaseModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static release not found', async () => {
      mockStaticReleaseModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static release fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static release', async () => {
      const updatedStaticRelease = {
        _id: '1',
        active: false,
      };
      mockStaticReleaseModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticRelease,
      );

      const result = await service.update('1', {
        active: false,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static release updated successfully',
        data: updatedStaticRelease,
      });
      expect(mockStaticReleaseModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static Release by ID', async () => {
      mockStaticReleaseModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticReleaseModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static release deleted successfully',
        data: [],
      });
    });
  });
});
