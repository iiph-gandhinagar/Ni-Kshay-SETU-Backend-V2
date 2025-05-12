import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { paginate } from '../common/pagination/pagination.service';
import { DynamicAlgoMasterService } from './dynamic-algo-master.service';
jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockDynamicMasterModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(), // allows chaining `.populate()`
    exec: jest
      .fn()
      .mockResolvedValue({ _id: '1', name: 'Test Dynamic master' }), // resolves the final query
  }),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Dynamic master' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Dynamic master' }),
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
const mockLanguageTranslation = {
  getSymptomTranslatedFields: jest
    .fn()
    .mockImplementation((doc) =>
      Promise.resolve({ translated: `${doc.name}-translated` }),
    ),
};
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('DynamicAlgoMasterService', () => {
  let service: DynamicAlgoMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicAlgoMasterService,
        {
          provide: getModelToken('DynamicAlgoMaster'),
          useValue: mockDynamicMasterModel,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
        { provide: LanguageTranslation, useValue: mockLanguageTranslation },
      ],
    }).compile();

    service = module.get<DynamicAlgoMasterService>(DynamicAlgoMasterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Dynamic Algo Master', async () => {
      const createDynamicAlgoDto = {
        id: 1,
        active: false,
        icon: 'Dynamic Algo master',
        title: { en: 'Dynamic Algo Master' },
      };
      const mockDynamicAlgo = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createDynamicAlgoDto,
      };
      mockDynamicMasterModel.create.mockResolvedValue(mockDynamicAlgo);

      const result = await service.create(createDynamicAlgoDto);
      console.log('result--->', result);
      expect(mockDynamicMasterModel.create).toHaveBeenCalledWith(
        createDynamicAlgoDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Master Created successfully',
        data: mockDynamicAlgo,
      });
    });
  });
  describe('findAll', () => {
    it('should call filterService.filter and paginate with correct arguments', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
        fromDate: '',
        toDate: '',
      };

      const mockQuery = { some: 'query' };
      const mockDynamicMasterAlgo = [
        { title: 'Dynamic Master Algo 1' },
        { title: 'Dynamic Master Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockDynamicMasterAlgo);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockDynamicMasterModel,
        paginationDto,
        [],
        mockQuery,
      );
      expect(result).toEqual(mockDynamicMasterAlgo);
    });
  });
  describe('findOne', () => {
    it('should return a Dynamic master by ID', async () => {
      const mockDynamic = { _id: '1', name: 'Test Dynamic master' };
      mockDynamicMasterModel.findById.mockReturnValue(mockDynamic);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Master fetch successfully',
        data: mockDynamic,
      });
      expect(mockDynamicMasterModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Dynamic Algo Master not found', async () => {
      mockDynamicMasterModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Master fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Dynamic Algo Master', async () => {
      const updatedDiagnosis = {
        _id: '1',
        active: false,
      };
      mockDynamicMasterModel.findByIdAndUpdate.mockResolvedValue(
        updatedDiagnosis,
      );

      const result = await service.update('1', {
        active: false,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Master updated successfully',
        data: updatedDiagnosis,
      });
      expect(mockDynamicMasterModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { active: false },
        { new: true },
      );
    });
  });
  describe('remove', () => {
    it('should delete a Dynamic Algo Master Algorithm by ID', async () => {
      mockDynamicMasterModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockDynamicMasterModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Master deleted successfully',
        data: [],
      });
    });
  });

  describe('dynamicParent', () => {
    const translatedDocs = [
      {
        _id: '1',
        name: 'Dynamic Algo 1',
        description: 'Algo Description',
        title: 'Algo Title',
      },
      {
        _id: '2',
        name: 'Dynamic Algo 2',
        description: 'Algo Description',
        title: 'Algo Title',
      },
    ];
    it('should fetch and return translated dynamic algorithm master list', async () => {
      mockDynamicMasterModel.find.mockReturnThis();
      mockDynamicMasterModel.lean.mockReturnThis();
      mockDynamicMasterModel.exec.mockResolvedValue([
        { _id: '1', name: 'Dynamic Algo 1' },
        { _id: '2', name: 'Dynamic Algo 2' },
      ]);

      const mockTranslated = {
        title: 'Algo Title',
        description: 'Algo Description',
      };

      jest
        .spyOn(mockLanguageTranslation, 'getSymptomTranslatedFields')
        .mockResolvedValue(mockTranslated);
      const result = await service.dynamicParent('en');

      expect(mockDynamicMasterModel.find).toHaveBeenCalledWith({
        active: true,
      });
      expect(
        mockLanguageTranslation.getSymptomTranslatedFields,
      ).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: translatedDocs,
      });
    });
  });
});
