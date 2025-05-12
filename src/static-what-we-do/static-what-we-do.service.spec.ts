import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticWhatWeDoService } from './static-what-we-do.service';
const mockStaticWhatWeDoModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test StaticWhat we do' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated StaticWhat we do' }),
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
describe('StaticWhatWeDoService', () => {
  let service: StaticWhatWeDoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticWhatWeDoService,
        {
          provide: getModelToken('StaticWhatWeDo'),
          useValue: mockStaticWhatWeDoModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticWhatWeDoService>(StaticWhatWeDoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Static what we do', async () => {
      const createStaticWhatWeDoDto = {
        location: 'location',
        coverImage: ['location'],
        orderIndex: 1,
        active: false,
        title: { en: 'Static what we do' },
      };
      const mockStaticWhatWeDo = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticWhatWeDoDto,
      };
      mockStaticWhatWeDoModel.create.mockResolvedValue(mockStaticWhatWeDo);

      const result = await service.create(createStaticWhatWeDoDto);
      console.log('result--->', result);
      expect(mockStaticWhatWeDoModel.create).toHaveBeenCalledWith(
        createStaticWhatWeDoDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static what we do Created successfully',
        data: mockStaticWhatWeDo,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static what we do with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticWhatWeDos = [
        { name: 'Static what we do 1' },
        { name: 'Static what we do 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticWhatWeDos),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticWhatWeDoModel.find.mockReturnValue(mockQuery);
      mockStaticWhatWeDoModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticWhatWeDos,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticWhatWeDoModel.find).toHaveBeenCalled();
      expect(mockStaticWhatWeDoModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Static what we do by ID', async () => {
      const mockStaticWhatWeDo = { _id: '1', title: 'Test Static what we do' };
      mockStaticWhatWeDoModel.findById.mockReturnValue(mockStaticWhatWeDo);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static what we do fetch successfully',
        data: mockStaticWhatWeDo,
      });
      expect(mockStaticWhatWeDoModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static what we do not found', async () => {
      mockStaticWhatWeDoModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static what we do fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Static what we do', async () => {
      const updatedStaticWhatWeDo = { _id: '1', active: false };
      mockStaticWhatWeDoModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticWhatWeDo,
      );

      const result = await service.update('1', {
        active: false,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static what we do updated successfully',
        data: updatedStaticWhatWeDo,
      });
      expect(mockStaticWhatWeDoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static What We Do by ID', async () => {
      mockStaticWhatWeDoModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticWhatWeDoModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static what we do deleted successfully',
        data: [],
      });
    });
  });
});
