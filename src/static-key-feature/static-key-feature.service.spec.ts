import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticKeyFeatureService } from './static-key-feature.service';

process.env.MONGO_URL = 'mongodb://localhost:27017/test-db';

// Mock MongoClient to avoid actual connection
jest.mock('mongodb', () => {
  const mCollection = {
    find: jest.fn().mockReturnValue({
      toArray: jest
        .fn()
        .mockResolvedValue([
          { assessments: [{ pending: 'no' }, { pending: 'yes' }] },
          { assessments: [{ pending: 'no' }] },
        ]),
    }),
  };
  const mDb = { collection: jest.fn().mockReturnValue(mCollection) };
  const mClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mDb),
    close: jest.fn(),
  };
  return { MongoClient: jest.fn(() => mClient) };
});

const mockStaticKeyFeatModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: '1', title: 'Feature 1' }]), // Mock data for exec
    }),
  }),
  findOne: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Key Feature' }),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Key Feature' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Key Feature' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  countDocuments: jest.fn().mockResolvedValue(20),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
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
const mockSubscriberModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(20),
};
const mockStaticTestimonialModel = {
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]), // Mock data for exec
    }),
  }),
};
const mockStaticWhatWeDoModel = {
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]), // Mock data for exec
    }),
  }),
};

const mockAssessmentResponseModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(20),
};
const mockSubscriberActivityModel = {
  findOne: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

describe('StaticKeyFeatureService', () => {
  let service: StaticKeyFeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticKeyFeatureService,
        {
          provide: getModelToken('StaticKeyFeature'),
          useValue: mockStaticKeyFeatModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('StaticTestimonial'),
          useValue: mockStaticTestimonialModel,
        },
        {
          provide: getModelToken('StaticWhatWeDo'),
          useValue: mockStaticWhatWeDoModel,
        },
        {
          provide: getModelToken('AssessmentResponse'),
          useValue: mockAssessmentResponseModel,
        },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticKeyFeatureService>(StaticKeyFeatureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Static key Feature', async () => {
      const createKeyFeatureDto = {
        id: 1,
        active: false,
        orderIndex: 1,
        title: { en: 'key feature' },
        description: { en: 'key feature' },
        icon: ['abc', 'static'],
        backgroundIcon: ['abc', 'static'],
      };
      const mockKeyFeature = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createKeyFeatureDto,
      };
      mockStaticKeyFeatModel.create.mockResolvedValue(mockKeyFeature);

      const result = await service.create(createKeyFeatureDto);
      console.log('result--->', result);
      expect(mockStaticKeyFeatModel.create).toHaveBeenCalledWith(
        createKeyFeatureDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static key feature Created successfully',
        data: mockKeyFeature,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static key feature with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockKeyFeatures = [
        { title: { en: 'Static key feature 1' } },
        { title: { en: 'Static key feature 2' } },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockKeyFeatures),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticKeyFeatModel.find.mockReturnValue(mockQuery);
      mockStaticKeyFeatModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockKeyFeatures,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticKeyFeatModel.find).toHaveBeenCalled();
      expect(mockStaticKeyFeatModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a Static key feature by ID', async () => {
      const mockKeyFeature = { _id: '1', title: 'Test Key feature' };
      mockStaticKeyFeatModel.findById.mockReturnValue(mockKeyFeature);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static key feature fetch successfully',
        data: mockKeyFeature,
      });
      expect(mockStaticKeyFeatModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static key feature not found', async () => {
      mockStaticKeyFeatModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static key feature fetch successfully',
        data: null,
      });
      // expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated Static key feature', async () => {
      const updatedBlock = { _id: '1', active: false };
      mockStaticKeyFeatModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('1', {
        active: false,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static key feature updated successfully',
        data: updatedBlock,
      });
      expect(mockStaticKeyFeatModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Static key feature by Id', async () => {
      mockStaticKeyFeatModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticKeyFeatModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static key feature deleted successfully',
        data: [],
      });
    });
  });

  describe('getHomePageData', () => {
    it('should fetch home page data correctly', async () => {
      const result = await service.getHomePageData('en');
      console.log('result --->', result);
      expect(mockStaticKeyFeatModel.find).toHaveBeenCalled();
      expect(mockAssessmentResponseModel.countDocuments).toHaveBeenCalled();
      expect(mockSubscriberModel.countDocuments).toHaveBeenCalled();
      expect(mockSubscriberActivityModel.countDocuments).toHaveBeenCalled();
      expect(mockStaticTestimonialModel.find).toHaveBeenCalled();
      expect(mockStaticWhatWeDoModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Home page data fetched successfully',
        data: {
          keyFeatures: [
            {
              title: {
                en: 'Static key feature 1',
              },
            },
            {
              title: {
                en: 'Static key feature 2',
              },
            },
          ],
          totalSubscriber: 20,
          totalVisitor: 20,
          totalAssessments: 22, // Adjust based on your logic
          staticTestimonials: [],
          whatWeDo: [],
        },
      });
    });

    it('should default language to "en" if not provided', async () => {
      await service.getHomePageData('');

      expect(mockStaticKeyFeatModel.find).toHaveBeenCalledWith({
        active: true,
      }); // Update this line
    });
  });
});
