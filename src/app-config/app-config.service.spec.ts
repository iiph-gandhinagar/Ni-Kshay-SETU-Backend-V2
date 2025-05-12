import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { AppConfigService } from './app-config.service';

const mockAppConfigModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test App Config' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated App Config' }),
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

const mockAdminService = {
  adminRoleFilter: jest.fn().mockResolvedValue([]),
};

const mockLeaderBoardLevelModel = {
  find: jest.fn(),
};

const mockAMasterCmModel = {
  find: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        { provide: getModelToken('AppConfig'), useValue: mockAppConfigModel },
        { provide: getModelToken('MasterCm'), useValue: mockAMasterCmModel },
        {
          provide: getModelToken('leaderBoardLevel'),
          useValue: mockLeaderBoardLevelModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: LanguageTranslation, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a App Config', async () => {
      const createAppConfigDto = {
        key: 'abc',
        value: { en: 'tb' },
      };
      const mockAppConfig = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createAppConfigDto,
      };
      mockAppConfigModel.create.mockResolvedValue(mockAppConfig);

      const result = await service.create(createAppConfigDto);
      expect(mockAppConfigModel.create).toHaveBeenCalledWith(
        createAppConfigDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Config created successfully',
        data: mockAppConfig,
      });
    });
  });

  describe('findAll', () => {
    it('should return App-Config with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockAppConfigs = [
        { name: 'App Config 1' },
        { name: 'App Config 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAppConfigs),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockAppConfigModel.find.mockReturnValue(mockQuery);
      mockAppConfigModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockAppConfigs,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockAppConfigModel.find).toHaveBeenCalled();
      expect(mockAppConfigModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a App Config by ID', async () => {
      const mockAppConfig = { _id: '1', name: 'Test App Config' };
      mockAppConfigModel.findById.mockReturnValue(mockAppConfig);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Config fetch successfully',
        data: mockAppConfig,
      });
      expect(mockAppConfigModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if App Config not found', async () => {
      mockAppConfigModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Config fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated App Config', async () => {
      const updatedAppConfig = { _id: '1', title: 'Updated App Config' };
      mockAppConfigModel.findByIdAndUpdate.mockResolvedValue(updatedAppConfig);

      const result = await service.update('1', { key: 'Updated key' });

      expect(result).toEqual({
        statusCode: 200,
        message: 'App Config updated successfully',
        data: updatedAppConfig,
      });
      expect(mockAppConfigModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { key: 'Updated key' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a App Config by ID', async () => {
      mockAppConfigModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockAppConfigModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'App Config deleted successfully',
        data: [],
      });
    });
  });

  describe('getLangCode', () => {
    it('should Get a language code', async () => {
      const mockLanguages = [
        {
          title: 'English',
          subTitle: 'English',
          code: 'en',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674454407LangEng.png',
        },
        {
          title: 'हिन्दी',
          subTitle: 'Hindi',
          code: 'hi',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
        },
        {
          title: 'ગુજરાતી',
          subTitle: 'Gujarati',
          code: 'gu',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674454349LangHindi.png',
        },
        {
          title: 'मराठी',
          subTitle: 'Marathi',
          code: 'mr',
          imgUrl:
            'https://api.nikshay-setu.in/uploads/1674454275LangMarathi.png',
        },
        {
          title: 'தமிழ்',
          subTitle: 'Tamil',
          code: 'ta',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
        },
        {
          title: 'ਪੰਜਾਬੀ',
          subTitle: 'Punjabi',
          code: 'pa',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
        },
        {
          title: 'ਪੰਜਾਬੀ',
          subTitle: 'Punjabi',
          code: 'pa',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
        },
        {
          title: 'తెలుగు',
          subTitle: 'Telugu',
          code: 'te',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
        },
        {
          title: 'ಕನ್ನಡ',
          subTitle: 'Kannada',
          code: 'kn',
          imgUrl: 'https://api.nikshay-setu.in/uploads/1674551981LangTamil.png',
        },
      ];

      const result = await service.getLangCode();

      expect(result).toEqual({
        statusCode: 200,
        message: 'language list',
        data: mockLanguages,
      });
    });
  });
});
