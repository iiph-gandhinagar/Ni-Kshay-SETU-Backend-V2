import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StaticBlogService } from './static-blog.service';
const mockStaticBlogModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Static Blog' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Static Blog' }),
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
describe('StaticBlogService', () => {
  let service: StaticBlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticBlogService,
        { provide: getModelToken('StaticBlog'), useValue: mockStaticBlogModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<StaticBlogService>(StaticBlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new static blog and return response', async () => {
      const createStaticBlogDto = {
        title: { en: 'Test Blog', hi: 'test', gu: 'blog' },
        shortDescription: { en: 'Test Blog', hi: 'test', gu: 'blog' },
        description: { en: 'Test Blog', hi: 'test', gu: 'blog' },
        orderIndex: 1,
        source: 'Test Blog',
        author: 'Test Blog',
        image1: 'image Blog1',
        image2: 'image Blog2',
        image3: 'image Blog3',
        active: false,
        keywords: ['blog', 'test'],
        slug: 'test-blog',
      };
      const mockStaticBlog = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createStaticBlogDto,
      };
      mockStaticBlogModel.create.mockResolvedValue(mockStaticBlog);
      const result = await service.create(createStaticBlogDto);
      expect(mockStaticBlogModel.create).toHaveBeenCalledWith(
        createStaticBlogDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog Created successfully',
        data: mockStaticBlog,
      });
    });
  });

  describe('findAll', () => {
    it('should return Static Blog with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockStaticBlogs = [
        { name: 'Static Blog 1' },
        { name: 'Static Blog 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStaticBlogs),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticBlogModel.find.mockReturnValue(mockQuery);
      mockStaticBlogModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto, 'en');
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockStaticBlogs,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticBlogModel.find).toHaveBeenCalled();
      expect(mockStaticBlogModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findAllBlogs', () => {
    it('should return all blogs with pagination', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };
      const lang = 'en';
      const mockPaginatedBlogs = [{ _id: '1', title: { en: 'Blog 1' } }];
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPaginatedBlogs),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockStaticBlogModel.find.mockReturnValue(mockQuery);
      mockStaticBlogModel.countDocuments.mockResolvedValue(20);
      const result = await service.findAllBlogs(paginationDto, lang);

      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockPaginatedBlogs,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockStaticBlogModel.find).toHaveBeenCalled();
      expect(mockStaticBlogModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('getBlogBySlug', () => {
    it('should default to English if lang is not provided', async () => {
      const slug = 'test-blog';
      const mockBlog = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        title: { en: 'Test Blog' },
        slug: 'test-blog',
        description: { en: 'This is a test blog' },
      };

      mockStaticBlogModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockBlog),
      });

      const result = await service.getBlogBySlug(slug, undefined);

      expect(mockStaticBlogModel.findOne).toHaveBeenCalledWith({ slug });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog fetch successfully',
        data: mockBlog,
      });
    });
  });

  describe('getSimilarBlogs', () => {
    it('should return similar blogs based on keywords', async () => {
      const slug = 'test-blog';
      const mockBlog = {
        keywords: ['tech', 'javascript'],
      };
      const mockSimilarBlogs = [
        {
          _id: '6666c830eb18953046b1b56c',
          title: { en: 'Another Tech Blog' },
          shortDescription: { en: 'Description' },
          author: 'Author',
          source: 'Source',
          orderIndex: 2,
          keywords: ['tech'],
          createdAt: new Date(),
          slug: 'another-tech-blog',
        },
      ];

      // Mocking the database queries
      mockStaticBlogModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockBlog),
      });

      mockStaticBlogModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSimilarBlogs),
        }),
      });

      const result = await service.getSimilarBlogs(slug);

      expect(mockStaticBlogModel.findOne).toHaveBeenCalledWith({
        slug: new RegExp(slug, 'i'),
      });

      expect(mockStaticBlogModel.find).toHaveBeenCalledWith({
        slug: { $ne: slug },
        keywords: {
          $in: [new RegExp('tech', 'i'), new RegExp('javascript', 'i')],
        },
        active: true,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog fetch successfully',
        data: mockSimilarBlogs,
      });
    });

    it('should return an empty list if no keywords are found', async () => {
      const slug = 'test-blog';

      // Mock database query returning no keywords
      mockStaticBlogModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getSimilarBlogs(slug);

      expect(mockStaticBlogModel.findOne).toHaveBeenCalledWith({
        slug: new RegExp(slug, 'i'),
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog fetch successfully',
        data: [],
      });
    });
  });

  describe('findOne', () => {
    it('should return a Static Blog by ID', async () => {
      const mockStaticBlog = { _id: '1', name: 'Test Static Blog' };
      mockStaticBlogModel.findById.mockReturnValue(mockStaticBlog);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog fetch successfully',
        data: mockStaticBlog,
      });
      expect(mockStaticBlogModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Static Blog not found', async () => {
      mockStaticBlogModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog fetch successfully',
        data: null,
      });
      // expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated Static Blog', async () => {
      const updatedStaticBlog = { _id: '1', active: false };
      mockStaticBlogModel.findByIdAndUpdate.mockResolvedValue(
        updatedStaticBlog,
      );

      const result = await service.update('1', { active: false });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog updated successfully',
        data: updatedStaticBlog,
      });
      expect(mockStaticBlogModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a block by ID if not linked to a subscriber', async () => {
      mockStaticBlogModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockStaticBlogModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Static blog deleted successfully',
        data: [],
      });
    });
  });
});
