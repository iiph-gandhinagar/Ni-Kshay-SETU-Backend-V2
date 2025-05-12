import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { KbaseService } from './kbase.service';

const mockMongoCollection = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
};

const mockMongoDb = {
  collection: jest.fn().mockReturnValue(mockMongoCollection),
};

const mockMongoClient = {
  connect: jest.fn(),
  db: jest.fn().mockReturnValue(mockMongoDb),
  close: jest.fn(),
};

// Replace the global MongoClient with mock
jest.mock('mongodb', () => {
  const actual = jest.requireActual('mongodb');
  return {
    ...actual,
    MongoClient: jest.fn().mockImplementation(() => mockMongoClient),
  };
});

const mockKbaseModel = {
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
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockSubscriberActivityModel = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockPrimaryCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockKbaseUserHistoryModel = {
  findOne: jest.fn(),
  aggregate: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
};

const mockSubscriberProgressHistoryModel = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
  sendError: jest.fn().mockImplementation((statusCode, errorMessage, data) => ({
    statusCode,
    errorMessage,
    data,
  })),
};
describe('KbaseService', () => {
  let service: KbaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KbaseService,
        { provide: getModelToken('Kbase'), useValue: mockKbaseModel },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        {
          provide: getModelToken('SubscriberActivity'),
          useValue: mockSubscriberActivityModel,
        },
        {
          provide: getModelToken('PrimaryCadre'),
          useValue: mockPrimaryCadreModel,
        },
        {
          provide: getModelToken('KbaseUserHistory'),
          useValue: mockKbaseUserHistoryModel,
        },
        {
          provide: getModelToken('subscriberProgressHistory'),
          useValue: mockSubscriberProgressHistoryModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<KbaseService>(KbaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourse', () => {
    it('should throw if user is not found', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCourse('123', 'Course Title')).rejects.toThrow(
        new HttpException(
          { message: 'User not found!', errors: 'Bad Request' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw if cadreGroup is null', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup: null }),
        }),
      });

      await expect(service.getCourse('123', 'Course Title')).rejects.toThrow(
        new HttpException(
          { message: 'course not found!', errors: 'No cadre Course Found!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
    it('should return course list on success', async () => {
      const mockCadreTitle = 'Nursing';
      const mockRegistryId = { _id: 'registry123' };
      const mockCourseData = [{ courseId: 'c1', courseTitle: 'Course A' }];

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup: 'group123' }),
        }),
      });
      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ title: mockCadreTitle }),
        }),
      });

      mockMongoCollection.toArray.mockResolvedValue([mockRegistryId]);

      mockKbaseModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue(mockCourseData),
      });

      const result = await service.getCourse('123', 'Course A');

      expect(mockMongoClient.connect).toHaveBeenCalled();
      expect(mockMongoDb.collection).toHaveBeenCalledWith(
        'kmap_batch_registry',
      );
      expect(mockKbaseModel.find).toHaveBeenCalledWith({
        courseTitle: expect.any(RegExp),
        registry_id: mockRegistryId._id,
        cadreTitle: { $in: [mockCadreTitle] },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase course fetch successfully',
        data: mockCourseData,
      });
      expect(mockMongoClient.close).toHaveBeenCalled();
    });

    it('should handle Mongo errors gracefully and still close client', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup: 'group123' }),
        }),
      });
      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ title: 'CadreX' }),
        }),
      });

      mockMongoCollection.toArray.mockRejectedValue(new Error('Mongo error'));

      await service.getCourse('123', 'Course X');

      expect(mockMongoClient.close).toHaveBeenCalled();
    });
  });

  describe('getModuleWithChapter', () => {
    it('should return module with chapter data successfully', async () => {
      const userId = 'user123';
      const cadreId = 'cadre123';
      const cadreGroup = 'group123';
      const registryId = 'registry456';
      const courseId = 'course789';

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreId }),
        }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup }),
        }),
      });
      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ title: 'Nursing' }),
        }),
      });
      mockMongoCollection.toArray.mockResolvedValue([{ _id: registryId }]);
      mockKbaseModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            _id: courseId,
            courseId,
            courseTitle: 'ABC',
          }),
        }) // First call
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce({
              courseTitle: 'ABC',
              module: [{ moduleTitle: 'Intro' }],
            }),
          }),
        }); // Second call

      const result = await service.getModuleWithChapter(userId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase module with chapter fetch successfully',
        data: { courseTitle: 'ABC', module: [{ moduleTitle: 'Intro' }] },
      });
      expect(mockMongoClient.close).toHaveBeenCalled();
    });

    it('should return error if subscriber not found', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await service.getModuleWithChapter('user123');

      expect(mockBaseResponse.sendError).toHaveBeenCalledWith(
        401,
        'No user Found',
        [],
      );

      // MongoDB was never connected, so we don't expect close to be called
      expect(mockMongoClient.connect).not.toHaveBeenCalled();
      expect(mockMongoClient.close).not.toHaveBeenCalled();
    });

    it('should handle Mongo errors and still close client', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
        }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup: 'group123' }),
        }),
      });
      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ title: 'Nursing' }),
        }),
      });

      mockMongoCollection.toArray.mockRejectedValue(new Error('DB Failure'));

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await service.getModuleWithChapter('user123');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error performing operation:',
        expect.any(Error),
      );
      expect(mockMongoClient.close).toHaveBeenCalled();
    });

    it('should handle missing primary cadre gracefully', async () => {
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
        }),
      });
      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ cadreGroup: null }),
        }),
      });

      await service.getModuleWithChapter('user123');

      // No throw, just logs (you can adjust this if logic changes)
      expect(mockMongoClient.close).toHaveBeenCalled();
    });
  });

  describe('getChapterWithContentPage', () => {
    it('should return module data with updated read statuses and progress', async () => {
      const courseId = '6666c830eb18953046b1b56b';
      const userId = '6666c830eb18953046b1b56b';

      const kbaseData = {
        module: [{ moduleId: '6666c830eb18953046b1b56b', chapters: [] }],
        totalModule: 1,
        courseId: '6666c830eb18953046b1b56b',
      };

      const userKbaseHistories = [
        {
          courseTitle: 'Test Course',
          moduleId: '6666c830eb18953046b1b56b',
          histories: [
            {
              chapterId: '6666c830eb18953046b1b56b',
              readContentIds: ['6666c830eb18953046b1b56b'],
            },
          ],
        },
      ];

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(kbaseData),
      });

      mockKbaseUserHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userKbaseHistories),
      });

      service.updateReadContentStatus = jest
        .fn()
        .mockResolvedValue([{ isModuleRead: true }]);

      mockSubscriberProgressHistoryModel.updateOne.mockResolvedValue({});

      const result = await service.getChapterWithContentPage(courseId, userId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase module with chapter fetch successfully',
        data: {
          module: [
            {
              isModuleRead: true,
            },
          ],
          totalModule: 1,
          totalReadModule: 1,
        },
      });
      expect(service.updateReadContentStatus).toHaveBeenCalledWith(
        kbaseData.module,
        userKbaseHistories,
      );
      expect(mockSubscriberProgressHistoryModel.updateOne).toHaveBeenCalled();
    });
    it('should return original module data if user has no reading history', async () => {
      const courseId = '6666c830eb18953046b1b56b';
      const userId = '6666c830eb18953046b1b56b';

      const kbaseData = {
        module: [{ moduleId: '6666c830eb18953046b1b56b', chapters: [] }],
        totalModule: 2,
        courseId: '6666c830eb18953046b1b56b',
      };

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(kbaseData),
      });

      mockKbaseUserHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getChapterWithContentPage(courseId, userId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase module with chapter fetch successfully',
        data: {
          module: kbaseData,
          totalModule: 2,
          totalReadModule: 0,
        },
      });
    });
    it('should handle errors during data fetch and still attempt progress update', async () => {
      const courseId = '6666c830eb18953046b1b56b';
      const userId = '6666c830eb18953046b1b56b';

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(
        service.getChapterWithContentPage(courseId, userId),
      ).rejects.toThrow('DB error');
    });
  });

  describe('addReadContent', () => {
    it('should add read content to existing module history', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const readContentDto = {
        courseId: '6666c830eb18953046b1b56b',
        moduleId: '6666c830eb18953046b1b56b',
        chapterId: '6666c830eb18953046b1b56b',
        contentId: '6666c830eb18953046b1b56b',
        audienceId: '6666c830eb18953046b1b56b',
      };

      const audienceDoc = { courseId: '6666c830eb18953046b1b56b' };
      const existingHistory = { _id: '6666c830eb18953046b1b56b' };
      const updatedHistory = {
        _id: '6666c830eb18953046b1b56b',
        moduleHistory: [],
      };

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(audienceDoc),
      });

      mockKbaseUserHistoryModel.findOne.mockResolvedValue(existingHistory);

      mockKbaseUserHistoryModel.findOneAndUpdate.mockResolvedValue(
        updatedHistory,
      );

      const result = await service.addReadContent(userId, readContentDto);

      expect(mockKbaseModel.findById).toHaveBeenCalledWith(
        readContentDto.courseId,
      );
      expect(mockKbaseUserHistoryModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: expect.any(Object),
          audienceId: audienceDoc.courseId,
          'moduleHistory.moduleId': '6666c830eb18953046b1b56b',
          'moduleHistory.chapterId': '6666c830eb18953046b1b56b',
        },
        {
          $addToSet: {
            'moduleHistory.$.readContentIds': '6666c830eb18953046b1b56b',
          },
        },
        { new: true, upsert: true },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase history added',
        data: updatedHistory,
      });
    });
    it('should create a new history document if none exists', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const readContentDto = {
        courseId: '6666c830eb18953046b1b56b',
        moduleId: '6666c830eb18953046b1b56b',
        chapterId: '6666c830eb18953046b1b56b',
        contentId: '6666c830eb18953046b1b56b',
        audienceId: '6666c830eb18953046b1b56b',
      };

      const audienceDoc = { courseId: '6666c830eb18953046b1b56b' };

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(audienceDoc),
      });

      mockKbaseUserHistoryModel.findOne.mockResolvedValue(null);

      mockKbaseUserHistoryModel.create.mockResolvedValue({
        _id: '6666c830eb18953046b1b56b',
        moduleHistory: [],
      });

      const result = await service.addReadContent(userId, readContentDto);

      expect(mockKbaseUserHistoryModel.create).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase history added',
        data: { _id: '6666c830eb18953046b1b56b', moduleHistory: [] },
      });
    });
    it('should throw an error if something goes wrong', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const readContentDto = {
        courseId: '6666c830eb18953046b1b56b',
        moduleId: '6666c830eb18953046b1b56b',
        chapterId: '6666c830eb18953046b1b56b',
        contentId: '6666c830eb18953046b1b56b',
        audienceId: '6666c830eb18953046b1b56b',
      };

      mockKbaseModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB failed')),
      });

      await expect(
        service.addReadContent(userId, readContentDto),
      ).rejects.toThrow('❌ Failed In kbase History Fetch data: DB failed');
    });
  });

  describe('kbaseCourseReport', () => {
    it('should return course report with user counts', async () => {
      const paginationDto: PaginationDto = {
        sortBy: 'createdAt',
        courseTitle: 'TB',
        cadreIds: ['cadre1', 'cadre2'],
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };

      const registryIdMock = [{ _id: 'registry123' }];

      const kbaseCourseMock = [
        {
          toObject: () => ({
            _id: 'course1',
            cadreId: ['pc1', 'pc2'],
          }),
        },
      ];

      const primaryCadresMock = [{ _id: 'pc1' }, { _id: 'pc2' }];
      const cadresMock = [{ _id: 'cg1' }];
      const subscriberCountMock = 5;
      mockMongoCollection.toArray.mockResolvedValue([{ _id: 'registry123' }]);
      mockKbaseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(kbaseCourseMock),
        }),
      });

      mockPrimaryCadreModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(primaryCadresMock),
      });
      mockCadreModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(cadresMock),
      });
      mockSubscriberModel.countDocuments.mockResolvedValue(subscriberCountMock);

      const result = await service.kbaseCourseReport(paginationDto);

      expect(mockMongoClient.connect).toHaveBeenCalled();
      expect(mockMongoDb.collection).toHaveBeenCalledWith(
        'kmap_batch_registry',
      );
      expect(mockKbaseModel.find).toHaveBeenCalledWith({
        registry_id: registryIdMock[0]._id,
        courseTitle: expect.any(RegExp),
        cadreTitle: { $in: paginationDto.cadreIds },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'kbase Course Details!!',
        data: [
          {
            _id: 'course1',
            cadreId: ['pc1', 'pc2'],
            userCount: 5,
          },
        ],
      });
      expect(mockMongoClient.close).toHaveBeenCalled();
    });
  });

  describe('kbaseReport', () => {
    it('should return kbase report with correct pagination and user data', async () => {
      const paginationDto: PaginationDto = {
        sortBy: 'createdAt',
        limit: 10,
        page: 1,
        country: '6666c830eb18953046b1b56b',
        stateIds: ['6666c830eb18953046b1b56b'],
        districtIds: ['6666c830eb18953046b1b56b'],
        userCadreId: ['6666c830eb18953046b1b56b'],
        courseTitle: 'TB',
        fromDate: '',
        toDate: '',
      };
      const mockAggregationResult = [
        {
          totalItems: 1,
          data: [{ userId: { _id: 'user1', cadreId: 'cadreId1' } }],
        },
      ];

      const mockCourse = {
        code: 200,
        data: [{ _id: '6666c830eb18953046b1b56b', title: 'TB Course' }],
      };

      const mockChapterResult = {
        data: {
          totalModule: 10,
          totalReadModule: 5,
        },
      };

      const mockPrimaryCadre = [
        {
          cadreGroup: { title: 'Group A' },
        },
      ];

      const mockLastAccess = [
        {
          userId: '6666c830eb18953046b1b56b',
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockTimeSpent = [
        { _id: '6666c830eb18953046b1b56b', totalTime: 120 },
      ];

      const mockUserFull = {
        _id: '6666c830eb18953046b1b56b',
        name: 'User One',
        phoneNo: '1234567890',
        email: 'user1@test.com',
        cadreId: { title: 'Cadre A' },
        cadreType: 'type1',
        stateId: { title: 'State X' },
        districtId: { title: 'District Y' },
      };

      mockFilterService.filter.mockResolvedValue({});
      mockKbaseUserHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregationResult),
      });
      mockSubscriberActivityModel.find
        .mockReturnValueOnce({
          sort: () => ({ lean: () => Promise.resolve(mockLastAccess) }),
        } as any)
        .mockReturnValueOnce({
          select: () => Promise.resolve(mockTimeSpent),
        } as any);
      jest.spyOn(service, 'getCourse').mockResolvedValue(mockCourse as any);
      jest
        .spyOn(service, 'getChapterWithContentPage')
        .mockResolvedValue(mockChapterResult as any);
      mockCadreModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockPrimaryCadre),
          }),
        }),
      });

      mockSubscriberModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue(mockUserFull),
            }),
          }),
        }),
      });

      const result = await service.kbaseReport(paginationDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Kbase Report List fetch successfully',
        data: {
          list: [
            {
              course: {
                _id: '6666c830eb18953046b1b56b',
                title: 'TB Course',
              },
              lastAccessDate: '',
              percentage: 50,
              primaryCadre: [
                {
                  cadreGroup: {
                    title: 'Group A',
                  },
                },
              ],
              totalModule: 10,
              totalReadModule: 5,
              totalTime: 0,
              userId: {
                _id: '6666c830eb18953046b1b56b',
                cadreId: {
                  title: 'Cadre A',
                },
                cadreType: 'type1',
                districtId: {
                  title: 'District Y',
                },
                email: 'user1@test.com',
                name: 'User One',
                phoneNo: '1234567890',
                stateId: {
                  title: 'State X',
                },
              },
            },
          ],
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
        },
      });
    });
  });

  describe('kbaseReportCsv', () => {
    it('should return kbase report data for valid input', async () => {
      const mockCourse = {
        code: 200,
        data: [{ _id: '6666c830eb18953046b1b56b', title: 'TB Course' }],
      };

      const mockChapterResult = {
        data: {
          totalModule: 10,
          totalReadModule: 5,
        },
      };
      const fakePaginationDto: any = {
        sortOrder: 'asc',
        sortBy: 'name',
        limit: 10,
        page: 1,
        country: null,
        stateIds: [],
        districtIds: [],
        userCadreId: [],
        blockIds: [],
        healthFacilityIds: [],
        courseTitle: 'Sample Course',
      };
      // Mock: filter query
      mockFilterService.filter.mockResolvedValue({ isActive: true });

      // Mock: userKbaseHistoryModel.aggregate()
      mockKbaseUserHistoryModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            userId: new mongoose.Types.ObjectId(),
          },
        ]),
      });

      // Mock: SubscriberActivity findOne and find
      mockSubscriberActivityModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            createdAt: new Date(),
          }),
        }),
      });
      mockSubscriberActivityModel.find.mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue([{ timeSpent: 120 }, { timeSpent: 30 }]),
      });

      // Mock: getCourse
      jest.spyOn(service, 'getCourse').mockResolvedValue(mockCourse as any);
      jest
        .spyOn(service, 'getChapterWithContentPage')
        .mockResolvedValue(mockChapterResult as any);

      // Mock: Subscriber.findById()
      const mockUser = {
        _id: '507f191e810c19729de860ea',
        email: 'test@example.com',
        phoneNo: '1234567890',
        cadreId: '507f191e810c19729de860ea',
        cadreType: 'Primary',
        name: 'Test User',
        stateId: { title: 'State' },
        districtId: { title: 'District' },
        blockId: { title: 'Block' },
        healthFacilityId: { healthFacilityCode: 'HF001' },
      };

      // Create a chainable mock that supports .populate().populate().populate()...select()
      const chainableMock = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUser),
      };

      mockSubscriberModel.findById.mockReturnValue(chainableMock);

      // Mock: cadreModel.find()
      mockCadreModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([
            {
              cadreGroup: {
                title: 'Medical Group',
              },
            },
          ]),
        }),
      });

      const res = await service.kbaseReportCsv(fakePaginationDto);

      expect(res).toEqual({
        statusCode: 200,
        message: 'Kbase Report List fetch successfully',
        data: [
          {
            userId: {
              _id: '507f191e810c19729de860ea',
              cadreId: '507f191e810c19729de860ea',
              blockId: {
                title: 'Block',
              },
              cadreType: 'Primary',
              districtId: {
                title: 'District',
              },
              email: 'test@example.com',
              name: 'Test User',
              phoneNo: '1234567890',
              stateId: {
                title: 'State',
              },
              healthFacilityId: {
                healthFacilityCode: 'HF001',
              },
            },
            primaryCadre: [
              {
                cadreGroup: {
                  title: 'Medical Group',
                },
              },
            ],
            course: {
              _id: '6666c830eb18953046b1b56b',
              title: 'TB Course',
            },
            totalModule: 10,
            totalReadModule: 5,
            percentage: 50,
            lastAccessDate: expect.any(String),
            totalTime: 150,
          },
        ],
      });
    });
  });
});
