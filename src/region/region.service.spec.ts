import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { RegionService } from './region.service';

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

const mockAssessmentModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};

const mockAdminUserModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};

const mockStateModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockDistrictModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};
const mockBlockModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};
const mockRoleModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};
const mockCadreModel = {
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
  }),
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({}),
  }),
  find: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    }),
  }),
  sort: jest.fn().mockReturnThis(),
  distinct: jest.fn().mockReturnThis(),
  exec: jest.fn().mockReturnThis(),
};
const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  exec: jest.fn(),
};

const mockCountryModel = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockReturnThis(),
};

const mockResourceMaterialModel = {
  find: jest.fn(),
};
const mockLatentTbModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockGuidanceModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockCGCModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockDifferentialCareModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockTreatmentModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockDiagnosisModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockPluginManagementModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockPrimaryCadreModel = {
  findOne: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
  exec: jest.fn().mockReturnThis(),
};

const mockHealthFacilityModel = {
  find: jest.fn().mockReturnValue({
    select: jest.fn(),
  }),
};

const mockFlashSimilarAppsModel = {
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
  }),
};

const mockFlashNewsModel = {
  find: jest.fn(),
};

describe('RegionService', () => {
  let service: RegionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionService,
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('District'), useValue: mockDistrictModel },
        { provide: getModelToken('Block'), useValue: mockBlockModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        {
          provide: getModelToken('ResourceMaterial'),
          useValue: mockResourceMaterialModel,
        },
        {
          provide: getModelToken('AlgorithmLatentTbInfection'),
          useValue: mockLatentTbModel,
        },
        {
          provide: getModelToken('AlgorithmGuidanceOnAdverseDrugReaction'),
          useValue: mockGuidanceModel,
        },
        {
          provide: getModelToken('AlgorithmDifferentialCare'),
          useValue: mockDifferentialCareModel,
        },
        {
          provide: getModelToken('AlgorithmCgcIntervention'),
          useValue: mockCGCModel,
        },
        {
          provide: getModelToken('PluginManagement'),
          useValue: mockPluginManagementModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('AlgorithmTreatment'),
          useValue: mockTreatmentModel,
        },
        {
          provide: getModelToken('AlgorithmDiagnosis'),
          useValue: mockDiagnosisModel,
        },
        {
          provide: getModelToken('PrimaryCadre'),
          useValue: mockPrimaryCadreModel,
        },
        {
          provide: getModelToken('HealthFacility'),
          useValue: mockHealthFacilityModel,
        },
        {
          provide: getModelToken('FlashSimilarApp'),
          useValue: mockFlashSimilarAppsModel,
        },
        { provide: getModelToken('FlashNews'), useValue: mockFlashNewsModel },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<RegionService>(RegionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStates', () => {
    it('should return all State', async () => {
      const mockState = [{ _id: '1', title: 'State' }];
      mockStateModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockState),
      });

      const result = await service.getAllStates();
      expect(mockStateModel.find).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All States fetch successfully',
        data: mockState,
      });
    });
  });

  describe('getAllAdminState', () => {
    it('should return states for admin with isAllState false and state data', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const mockAdminUser = { isAllState: false, state: ['state1', 'state2'] };
      const mockStates = [{ title: 'State1' }, { title: 'State2' }];

      mockAdminUserModel.findById.mockResolvedValue(mockAdminUser);
      mockStateModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockStates),
      });

      const result = await service.getAllAdminState(userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockStateModel.find).toHaveBeenCalledWith({
        _id: { $in: mockAdminUser.state },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All States fetch successfully',
        data: mockStates,
      });
    });

    it('should return all states for admin with isAllState true', async () => {
      const userId = '6666c830eb18953046b1b56b';
      const mockAdminUser = { isAllState: true };
      const mockStates = [{ title: 'State1' }, { title: 'State2' }];

      mockAdminUserModel.findById.mockResolvedValue(mockAdminUser);
      mockStateModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockStates),
      });

      const result = await service.getAllAdminState(userId);

      expect(mockStateModel.find).toHaveBeenCalledWith();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All States fetch successfully',
        data: mockStates,
      });
    });

    it('should throw an error if admin user is not found', async () => {
      const userId = '6666c830eb18953046b1b56b';
      mockAdminUserModel.findById.mockResolvedValue(null);

      await expect(service.getAllAdminState(userId)).rejects.toThrowError(
        new HttpException(
          {
            message: 'Admin User Not Found',
            error: 'Admin User Not Found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('getAllAdminDistrict', () => {
    it('should return districts based on adminUser.district', async () => {
      const mockAdminUser = {
        isAllDistrict: false,
        district: ['district1', 'district2'],
      };
      const mockDistricts = [{ title: 'District 1' }, { title: 'District 2' }];

      mockAdminUserModel.findById.mockResolvedValue(mockAdminUser);
      mockDistrictModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDistricts),
      });

      const result = await service.getAllAdminDistrict(
        '6666c830eb18953046b1b56b',
      );

      expect(mockDistrictModel.find).toHaveBeenCalledWith({
        _id: { $in: mockAdminUser.district },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });

    it('should return districts based on adminUser.state if no specific districts', async () => {
      const mockAdminUser = {
        isAllDistrict: false,
        district: [],
        isAllState: false,
        state: ['state1', 'state2'],
      };
      const mockDistricts = [
        { title: 'State District 1' },
        { title: 'State District 2' },
      ];

      mockAdminUserModel.findById.mockResolvedValue(mockAdminUser);
      mockDistrictModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDistricts),
      });

      const result = await service.getAllAdminDistrict(
        '6666c830eb18953046b1b56b',
      );

      expect(mockDistrictModel.find).toHaveBeenCalledWith({
        stateId: { $in: mockAdminUser.state },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });

    it('should return all districts if adminUser has access to all states and districts', async () => {
      const mockAdminUser = { isAllDistrict: true, isAllState: true };
      const mockDistricts = [
        { title: 'All District 1' },
        { title: 'All District 2' },
      ];

      mockAdminUserModel.findById.mockResolvedValue(mockAdminUser);
      mockDistrictModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDistricts),
      });

      const result = await service.getAllAdminDistrict(
        '6666c830eb18953046b1b56b',
      );

      expect(mockDistrictModel.find).toHaveBeenCalledWith();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });

    it('should throw an error if admin user is not found', async () => {
      const userId = '6666c830eb18953046b1b56b';
      mockAdminUserModel.findById.mockResolvedValue(null);

      await expect(service.getAllAdminState(userId)).rejects.toThrowError(
        new HttpException(
          {
            message: 'Admin User Not Found',
            error: 'Admin User Not Found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('getAllDistricts', () => {
    it('should return districts based on search query', async () => {
      const paginationDto: PaginationDto = {
        search: 'Test',
        stateId: [],
        allState: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockDistricts = [{ title: 'Test District' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDistricts),
      };

      mockDistrictModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllDistricts(paginationDto);

      expect(mockDistrictModel.find).toHaveBeenCalledWith({ stateId: /Test/i });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });
    it('should return all districts if allState is true', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        stateId: [],
        allState: 'true',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockDistricts = [{ title: 'District 1' }, { title: 'District 2' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDistricts),
      };

      mockDistrictModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllDistricts(paginationDto);

      expect(mockDistrictModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });
    it('should filter districts by stateId array', async () => {
      const stateIds = ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'];
      const paginationDto: PaginationDto = {
        search: '',
        stateId: stateIds,
        allState: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockDistricts = [{ title: 'District A' }, { title: 'District B' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDistricts),
      };

      mockDistrictModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllDistricts(paginationDto);

      const expectedQuery = {
        $or: stateIds.map((id) => ({
          stateId: new mongoose.Types.ObjectId(id),
        })),
      };
      expect(mockDistrictModel.find).toHaveBeenCalledWith(expectedQuery);
      expect(result).toEqual({
        statusCode: 200,
        message: 'All districts fetch successfully',
        data: mockDistricts,
      });
    });
  });

  describe('getAllBlocks', () => {
    it('should return Blocks based on search query', async () => {
      const paginationDto: PaginationDto = {
        search: 'Test',
        districtId: [],
        allDistrict: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockBlocks = [{ title: 'Test Block' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlocks),
      };

      mockBlockModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllBlocks(paginationDto);

      expect(mockBlockModel.find).toHaveBeenCalledWith({
        districtId: /Test/i,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All blocks fetch successfully',
        data: mockBlocks,
      });
    });
    it('should return all Blocks if allDistrict is true', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        districtId: [],
        allDistrict: 'true',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockBlocks = [{ title: 'Block 1' }, { title: 'Block 2' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlocks),
      };

      mockBlockModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllBlocks(paginationDto);

      expect(mockBlockModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        statusCode: 200,
        message: 'All blocks fetch successfully',
        data: mockBlocks,
      });
    });
    it('should filter Blocks by districtId array', async () => {
      const districtIds = [
        '6666c830eb18953046b1b56b',
        '6666c830eb18953046b1b56b',
      ];
      const paginationDto: PaginationDto = {
        search: '',
        districtId: districtIds,
        allDistrict: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockBlocks = [{ title: 'Blocks A' }, { title: 'Blocks B' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBlocks),
      };

      mockBlockModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllBlocks(paginationDto);

      expect(mockBlockModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        statusCode: 200,
        message: 'All blocks fetch successfully',
        data: mockBlocks,
      });
    });
  });

  describe('getAllCadres', () => {
    it('should filter Blocks by districtId array', async () => {
      const cadreTypes = [
        '6666c830eb18953046b1b56b',
        '6666c830eb18953046b1b56b',
      ];
      const paginationDto: PaginationDto = {
        search: '',
        cadreTypes: cadreTypes,
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockCadres = [{ title: 'Cadre A' }, { title: 'Cadre B' }];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCadres),
      };
      mockCadreModel.find.mockReturnValue(mockQuery);
      const result = await service.getAllCadres(paginationDto);
      const expectedQuery = {
        $or: cadreTypes.map((t) => ({
          cadreType: { $regex: t, $options: 'i' },
        })),
      };
      expect(mockCadreModel.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockQuery.sort).toHaveBeenCalledWith([
        ['title', 1],
        [
          'FIELD(title , "Consultant - Development Partner","Technical Officer (TB)","Specialist (TB)","National Consultant (TB)","Joint Director (TB)","Additional Deputy Director General (ADDG) -TB","Deputy Director General (DDG) - TB")',
          -1,
        ],
      ]);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All cadres fetch successfully',
        data: mockCadres,
      });
    });
  });

  describe('getAllCadreList', () => {
    it('should filter cadre List', async () => {
      const mockCadres = [{ title: 'Cadre A' }, { title: 'Cadre B' }];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCadres),
      };
      mockCadreModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllCadreList();

      expect(mockCadreModel.find).toHaveBeenCalledWith({});
      expect(mockQuery.sort).toHaveBeenCalledWith([
        ['title', 1],
        [
          'FIELD(title , "Consultant - Development Partner","Technical Officer (TB)","Specialist (TB)","National Consultant (TB)","Joint Director (TB)","Additional Deputy Director General (ADDG) -TB","Deputy Director General (DDG) - TB")',
          -1,
        ],
      ]);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All cadres fetch successfully',
        data: mockCadres,
      });
    });
  });

  describe('getAllCadreTypes', () => {
    it('should return sorted cadre types with priority', async () => {
      const mockCadreTypes = [
        'National_Level',
        'District_Level',
        'State_Level',
      ];
      mockCadreModel.exec.mockResolvedValue(mockCadreTypes);

      const expectedResponse = {
        statusCode: 200,
        message: 'All cadre Types fetch successfully',
        data: ['National_Level', 'District_Level', 'State_Level'],
      };

      const result = await service.getAllCadreTypes();

      expect(mockCadreModel.distinct).toHaveBeenCalledWith('cadreType');
      expect(mockCadreModel.exec).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAllHealthFacilities', () => {
    it('should return Health facility based on search query', async () => {
      const paginationDto: PaginationDto = {
        search: 'Test',
        blockId: [],
        allBlock: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockHealthFacility = [{ title: 'Test Health Facility' }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHealthFacility),
      };

      mockHealthFacilityModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllHealthFacilities(paginationDto);

      expect(mockHealthFacilityModel.find).toHaveBeenCalledWith({
        blockId: /Test/i,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'All health facilities fetch successfully',
        data: mockHealthFacility,
      });
    });
    it('should return all Health Facility if allBlocks is true', async () => {
      const paginationDto: PaginationDto = {
        search: '',
        blockId: [],
        allBlock: 'true',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockHealthFacility = [
        { title: 'Health Facility 1' },
        { title: 'Health Facility 2' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHealthFacility),
      };

      mockHealthFacilityModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllHealthFacilities(paginationDto);

      expect(mockHealthFacilityModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        statusCode: 200,
        message: 'All health facilities fetch successfully',
        data: mockHealthFacility,
      });
    });
    it('should filter health facility by blockIds array', async () => {
      const blockIds = ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'];
      const paginationDto: PaginationDto = {
        search: '',
        blockId: blockIds,
        allBlock: 'false',
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockHealthFacility = [
        { healthFacilityCode: 'Health Facility A' },
        { healthFacilityCode: 'Health Facility B' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHealthFacility),
      };

      mockHealthFacilityModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllHealthFacilities(paginationDto);
      const expectedQuery = {
        $or: blockIds.map((id) => ({
          blockId: new mongoose.Types.ObjectId(id),
        })),
      };

      expect(mockHealthFacilityModel.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All health facilities fetch successfully',
        data: mockHealthFacility,
      });
    });
  });

  describe('getAllCountries', () => {
    it('should return sorted cadre types with priority', async () => {
      const mockCountries = [{ title: 'India' }, { title: 'USA' }];

      mockCountryModel.exec.mockResolvedValue(mockCountries);

      const result = await service.getAllCountries();

      expect(mockCountryModel.find).toHaveBeenCalled();
      expect(mockCountryModel.sort).toHaveBeenCalledWith([['title', 1]]);
      expect(mockCountryModel.exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'All Country fetch successfully',
        data: mockCountries,
      });
    });
  });

  describe('getMasterNodes', () => {
    it('should return master nodes for Differential Care Algorithm', async () => {
      const mockNodes = [{ title: 'Differential Node 1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockNodes), // Should return an array, not an object
      };

      mockDifferentialCareModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes(
        'Differential Care Algorithm',
      );

      expect(mockDifferentialCareModel.find).toHaveBeenCalledWith({
        parentId: null,
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should return master nodes for Diagnosis Algorithm', async () => {
      const mockNodes = [{ title: 'Diagnosis Algorithm  1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        select: jest.fn().mockReturnThis(), // Keep returning `this` for chaining
        exec: jest.fn().mockResolvedValue(mockNodes), // Ensure `exec()` returns the array
      };

      mockDiagnosisModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes('Diagnosis Algorithm');

      expect(mockDiagnosisModel.find).toHaveBeenCalledWith({
        parentId: null,
      });
      expect(mockDiagnosisModel.find().select).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should return master nodes for Guidance on ADR', async () => {
      const mockNodes = [{ title: 'Guidance on ADR  1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNodes), // Should return an array, not an object
      };

      mockGuidanceModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes('Guidance on ADR');

      expect(mockGuidanceModel.find).toHaveBeenCalledWith({
        parentId: null,
      });
      expect(mockGuidanceModel.find().select).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should return master nodes for Latent TB Infection', async () => {
      const mockNodes = [{ title: 'Latent TB Infection  1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNodes), // Should return an array, not an object
      };

      mockLatentTbModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes('Latent TB Infection');

      expect(mockLatentTbModel.find).toHaveBeenCalledWith({
        parentId: null,
      });
      expect(mockLatentTbModel.find().select).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should return master nodes for Treatment Algorithm', async () => {
      const mockNodes = [{ title: 'Treatment Algorithm  1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNodes), // Should return an array, not an object
      };

      mockTreatmentModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes('Treatment Algorithm');

      expect(mockTreatmentModel.find).toHaveBeenCalledWith({
        parentId: null,
      });
      expect(mockTreatmentModel.find().select).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should return master nodes for CGC Algorithm', async () => {
      const mockNodes = [{ title: 'CGC Algorithm  1' }];

      // Ensure find().exec() returns an ARRAY
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNodes), // Should return an array, not an object
      };

      mockCGCModel.find.mockReturnValue(mockQuery);

      const result = await service.getMasterNodes('CGC Algorithm');

      expect(mockCGCModel.find).toHaveBeenCalledWith({
        parentId: null,
      });
      expect(mockCGCModel.find().select).toHaveBeenCalledWith('title');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Algorithm by Type fetch successfully',
        data: mockNodes, // Ensure test expects an array
      });
    });
    it('should throw BadRequestException for an invalid type', async () => {
      await expect(service.getMasterNodes('Invalid Type')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('homePage', () => {
    it('should return home page activities', async () => {
      const userId = '6666c830eb18953046b1b56b';

      const mockFlashSimilarApps = [{ name: 'App 1' }, { name: 'App 2' }];
      const mockFlashNews = [{ title: 'News 1' }, { title: 'News 2' }];
      const mockPlugins = [{ title: 'Plugin 1' }, { title: 'Plugin 2' }];
      // const cadreId = ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'];
      const mockCadreId = new mongoose.Types.ObjectId(userId);
      mockFlashSimilarAppsModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockReturnValue(mockFlashSimilarApps),
      });

      // Mock flashNewsModel.find()
      mockFlashNewsModel.find.mockResolvedValue(mockFlashNews);

      // Mock subscriberModel.findById()
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ cadreId: mockCadreId }), // ✅ Ensure exec() is mocked
        }),
      });

      // Mock pluginManagementModel.find()
      mockPluginManagementModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockReturnValue(mockPlugins),
      });

      const result = await service.homePage(userId);

      expect(mockFlashSimilarAppsModel.find).toHaveBeenCalledWith({
        active: true,
      });
      expect(mockFlashNewsModel.find).toHaveBeenCalledWith({ active: true });
      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
      );
      expect(mockPluginManagementModel.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [{ cadreId: { $in: [mockCadreId] } }, { isAllCadre: true }],
          },
        ],
      });
      expect(result).toEqual({
        statusCode: 200,
        message: expect.any(String),
        data: {
          flashSimilarApps: mockFlashSimilarApps,
          flashNews: mockFlashNews,
          plugins: mockPlugins,
        },
      });
    });
  });

  describe('defaultOptionSelection', () => {
    it('should return default options details', async () => {
      const mockCadreType = { _id: '123', cadreType: '/International_Level/i' };
      const mockCadreId = { _id: '456', title: '/TB Specialist/i' };
      const mockCadreGroup = {
        _id: '789',
        title: '/Program Managers- Others/i',
      };
      const mockState = [{ _id: '111', title: '/INTERNATIONAL/i' }];
      const mockDistrict = [{ _id: '222', title: '/INTERNATIONAL/i' }];

      // Mock database queries
      mockCadreModel.findOne
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCadreType),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCadreId),
          }),
        });
      mockPrimaryCadreModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCadreGroup),
        }),
      });
      mockStateModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockState),
        }),
      });
      mockDistrictModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDistrict),
        }),
      });

      const result = await service.defaultOptionSelection();

      expect(mockCadreModel.findOne).toHaveBeenCalledWith({
        cadreType: new RegExp('International_Level', 'i'),
      });
      expect(mockCadreModel.findOne).toHaveBeenCalledWith({
        title: new RegExp('TB Specialist', 'i'),
      });
      expect(mockPrimaryCadreModel.findOne).toHaveBeenCalledWith({
        title: new RegExp('Program Managers- Others', 'i'),
      });
      expect(mockStateModel.find).toHaveBeenCalledWith({
        title: new RegExp('INTERNATIONAL', 'i'),
      });
      expect(mockDistrictModel.find).toHaveBeenCalledWith({
        title: new RegExp('INTERNATIONAL', 'i'),
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Default Cadre Details!!',
        data: {
          cadreType: mockCadreType,
          cadreId: mockCadreId,
          cadreGroup: mockCadreGroup,
          stateId: mockState,
          districtId: mockDistrict,
        },
      });
    });
  });

  describe('masterDropDown', () => {
    it('should return master data for an Admin user', async () => {
      const userId = '123';
      const adminUser = {
        role: 'adminRoleId',
        state: 'state1',
        isAllState: true,
      };
      const role = { name: 'Admin' };
      mockAdminUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(adminUser),
      });

      mockRoleModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(role),
      });
      mockResourceMaterialModel.find.mockResolvedValue([]);
      [
        mockDiagnosisModel,
        mockTreatmentModel,
        mockLatentTbModel,
        mockGuidanceModel,
        mockDifferentialCareModel,
        mockCGCModel,
        mockAssessmentModel,
      ].forEach((model) => {
        model.find.mockReturnValue({
          select: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        });
      });

      const result = await service.masterDropDown(userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockAdminUserModel.findById().select).toHaveBeenCalledWith(
        'name role state isAllState',
      );

      expect(mockRoleModel.findById).toHaveBeenCalledWith(adminUser.role);
      expect(mockRoleModel.findById().select).toHaveBeenCalledWith('name');
      expect(mockDiagnosisModel.find).toHaveBeenCalledWith({
        activated: true,
      });
      expect(mockDiagnosisModel.find().select).toHaveBeenCalledWith('title.en');
      expect(mockDiagnosisModel.find().select().exec).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Data',
        data: {
          assessments: [],
          cgcAlgo: [],
          differentialAlgo: [],
          guidanceAlgo: [],
          latentTbAlgo: [],
          treatmentAlgo: [],
          diagnosisAlgo: [],
          resourceMaterial: [],
        },
      });
    });
    it('should return master data for a non-Admin user', async () => {
      const userId = '123';
      const adminUser = {
        role: 'userRoleId',
        state: 'state1',
        isAllState: false,
      };
      const role = { name: 'User' };

      mockAdminUserModel.findById().select.mockResolvedValue(adminUser);
      mockRoleModel.findById().select.mockResolvedValue(role);

      mockResourceMaterialModel.find.mockResolvedValue([]);
      [
        mockDiagnosisModel,
        mockTreatmentModel,
        mockLatentTbModel,
        mockGuidanceModel,
        mockDifferentialCareModel,
        mockCGCModel,
        mockAssessmentModel,
      ].forEach((model) => {
        model.find.mockReturnValue({
          select: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        });
      });

      const result = await service.masterDropDown(userId);

      expect(mockAdminUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockRoleModel.findById).toHaveBeenCalledWith(adminUser.role);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Master Data',
        data: {
          assessments: [],
          cgcAlgo: [],
          differentialAlgo: [],
          guidanceAlgo: [],
          latentTbAlgo: [],
          treatmentAlgo: [],
          diagnosisAlgo: [],
          resourceMaterial: [],
        },
      });
    });
  });
});
