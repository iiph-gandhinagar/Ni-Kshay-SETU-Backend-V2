import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { AlgorithmCgcInterventionService } from './algorithm-cgc-intervention.service';
jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockCGcModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(), // allows chaining `.populate()`
    exec: jest
      .fn()
      .mockResolvedValue({ _id: '1', name: 'Test CGC Intervention' }), // resolves the final query
  }),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test CGC Intervention' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated CGC Intervention' }),
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

const mockDifferentialCareModel = {
  findOne: jest.fn(),
};

const mockGuidanceOnAdrModel = {
  findOne: jest.fn(),
};

const mockTreatmentModel = {
  findOne: jest.fn(),
};

const mockLatentTbModel = {
  findOne: jest.fn(),
};

const mockDiagnosisModel = {
  findOne: jest.fn(),
};

const mockStateModel = {
  findOne: jest.fn(),
};

const mockCadreModel = {
  findOne: jest.fn(),
};

const mockSubscriberModel = {
  findById: jest.fn(),
  find: jest.fn(),
};

const mockUserDeviceTokenModel = {
  findOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  select: jest
    .fn()
    .mockResolvedValue([
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ]),
};

const mockUserNotificationModel = {
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({
    _id: {
      toString: () => 'mockNotificationId',
    },
  }),
};

const mockLanguageTranslation = {
  getTranslatedFields: jest.fn(),
};

const mockFirebaseService = {
  getTranslatedFields: jest.fn(),
};

const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('AlgorithmCgcInterventionService', () => {
  let service: AlgorithmCgcInterventionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgorithmCgcInterventionService,
        {
          provide: getModelToken('AlgorithmDiagnosis'),
          useValue: mockDiagnosisModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('AlgorithmDifferentialCare'),
          useValue: mockDifferentialCareModel,
        },
        {
          provide: getModelToken('AlgorithmGuidanceOnAdverseDrugReaction'),
          useValue: mockGuidanceOnAdrModel,
        },
        {
          provide: getModelToken('AlgorithmTreatment'),
          useValue: mockTreatmentModel,
        },
        {
          provide: getModelToken('AlgorithmLatentTbInfection'),
          useValue: mockLatentTbModel,
        },
        {
          provide: getModelToken('AlgorithmCgcIntervention'),
          useValue: mockCGcModel,
        },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        { provide: LanguageTranslation, useValue: mockLanguageTranslation },
        { provide: FirebaseService, useValue: mockFirebaseService },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<AlgorithmCgcInterventionService>(
      AlgorithmCgcInterventionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a CGC Intervention Algorithm', async () => {
      const createCgcDto = {
        id: 1,
        nodeType: 'Node Type',
        isExpandable: false,
        hasOptions: false,
        masterNodeId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        timeSpent: '20',
        index: 1,
        stateIds: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllState: false,
        cadreType: 'State_Level',
        cadreIds: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllCadre: false,
        title: {
          en: 'CGC Algorithm',
          hi: 'CGC Algorithm',
          gu: 'CGC Algorithm',
        },
        icon: 'icon',
        description: {
          en: 'CGC Intervention Algorithm Description',
          hi: '',
          gu: '',
        },
        header: {},
        subHeader: {},
        parentId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        redirectAlgoType: 'Redirect Algo Type',
        redirectAlgoNodeId: new mongoose.Types.ObjectId(
          '6666c830eb18953046b1b56b',
        ),
        sendInitialNotification: false,
        activated: true,
        deletedAt: null,
      };
      const mockCgc = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createCgcDto,
      };
      mockCGcModel.create.mockResolvedValue(mockCgc);

      const result = await service.create(createCgcDto);
      expect(mockCGcModel.create).toHaveBeenCalledWith(createCgcDto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'CGC Intervention Algorithm Created successfully',
        data: mockCgc,
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
      const mockCgcAlgo = [
        { name: 'CGC Intervention Algo 1' },
        { name: 'CGC Intervention Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockCgcAlgo);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockCGcModel,
        paginationDto,
        [
          { path: 'stateIds', select: 'title' },
          { path: 'cadreIds', select: 'title' },
        ],
        mockQuery,
      );
      expect(result).toEqual(mockCgcAlgo);
    });
  });

  describe('findOne', () => {
    it('should return a CGC by ID', async () => {
      const mockCgc = { _id: '1', name: 'Test CGC' };
      mockCGcModel.findById.mockReturnValue(mockCgc);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'CGC Intervention Algorithm fetch successfully',
        data: mockCgc,
      });
      expect(mockCGcModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if CGC not found', async () => {
      mockCGcModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'CGC Intervention Algorithm fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated CGC', async () => {
      const updatedCgc = { _id: '1', nodeType: 'Updated CGC' };
      mockCGcModel.findByIdAndUpdate.mockResolvedValue(updatedCgc);

      const result = await service.update('1', {
        nodeType: 'Updated CGC',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'CGC Intervention Algorithm updated successfully',
        data: updatedCgc,
      });
      expect(mockCGcModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { nodeType: 'Updated CGC' },
        { new: true },
      );
    });
  });
  describe('remove', () => {
    it('should delete a CGC Algorithm by ID', async () => {
      mockCGcModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockCGcModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'CGC Intervention Algorithm deleted successfully',
        data: [],
      });
    });
  });

  describe('getChild', () => {
    it('should return child nodes when rootNode is found', async () => {
      const rootNodeId = '123';
      const lang = 'hi';

      const rootNode = {
        _id: '123',
        title: { en: 'Root EN', hi: 'Root HI' },
        description: { en: 'Desc EN', hi: 'Desc HI' },
        children: [],
      };

      const mockChildren = [{ _id: '456', title: 'Child' }];

      mockCGcModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(rootNode),
      });

      (service as any).fetchDescendants = jest
        .fn()
        .mockResolvedValue(mockChildren);

      const result = await service.getChild(rootNodeId, lang);

      expect(mockCGcModel.findById).toHaveBeenCalledWith(rootNodeId);
      expect(service.fetchDescendants).toHaveBeenCalledWith(rootNode, lang);
      expect(result).toEqual({
        statusCode: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: rootNode._id,
          title: { hi: 'Root HI' },
          description: { hi: 'Desc HI' },
          children: mockChildren,
        },
      });
    });

    it('should return empty array if rootNode is not found', async () => {
      mockCGcModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getChild('not-found-id', 'en');
      expect(result).toEqual([]);
    });

    it('should fallback to "en" if lang is not provided', async () => {
      const rootNode = {
        _id: '123',
        title: { en: 'Root EN' },
        description: { en: 'Desc EN' },
        children: [],
      };

      mockCGcModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(rootNode),
      });

      (service as any).fetchDescendants = jest.fn().mockResolvedValue([]);

      const result = await service.getChild('123', '');
      expect(result).toEqual({
        statusCode: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: '123',
          title: { en: 'Root EN' },
          description: { en: 'Desc EN' },
          children: [],
        },
      });
    });
  });

  describe('getMasterNodes', () => {
    it('should return master nodes with status 200', async () => {
      const mockNodes = [
        { _id: '1', title: { en: 'Node 1' } },
        { _id: '2', title: { en: 'Node 2' } },
      ];

      mockCGcModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNodes();

      expect(mockCGcModel.find).toHaveBeenCalledWith({ parentId: null });

      expect(result).toEqual({
        statusCode: 200,
        message: 'List of Master Nodes',
        data: mockNodes,
      });
    });
  });

  describe('getMasterNode', () => {
    it('should return master nodes for subscriber with stateId', async () => {
      const mockUser = { stateId: 's1', cadreId: 'c1' };
      const mockNodes = [{ _doc: { title: 'Original' } }];

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      mockCGcModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNode('userId123', 'en');
      expect(mockCGcModel.find).toHaveBeenCalled();
      expect(mockLanguageTranslation.getTranslatedFields).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: 'List of Master Nodes',
        data: [
          {
            title: 'Original',
          },
        ],
      });
    });
  });

  describe('getAllDescendants', () => {
    it('should return all root nodes with their descendants', async () => {
      const lang = 'en';
      const rootNodes = [{ _id: '1' }, { _id: '2' }];

      const populatedNode = {
        _id: '1',
        title: { en: 'Title' },
        description: { en: 'Description' },
        children: [],
      };

      mockCGcModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(rootNodes),
      });

      mockCGcModel.findById.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedNode),
      }));

      (service as any).fetchDescendants = jest.fn().mockResolvedValue([]);

      mockBaseResponse.sendResponse.mockReturnValue({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: [],
      });

      const result = await service.getAllDescendants(lang);

      expect(mockCGcModel.find).toHaveBeenCalledWith({
        activated: true,
        parentId: null,
      });

      expect(mockCGcModel.findById).toHaveBeenCalledTimes(2);
      expect(service.fetchDescendants).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: expect.any(Array),
      });
    });
  });

  describe('sendInitialInvitation', () => {
    const mockCGcId = '6666c830eb18953046b1b56b';
    const mockAdminUserId = '6666c830eb18953046b1b56b';
    const mockUserIds = [
      '6666c830eb18953046b1b56b',
      '6666c830eb18953046b1b56b',
    ];
    const mockDeviceTokens = [
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ];
    const mockNotificationSaved = { _id: 'mockNotificationId' };
    it('should add notification to queue and return response', async () => {
      mockCGcModel.findById.mockResolvedValue({
        _id: mockCGcId,
        parentId: null,
        title: { en: 'CGC Title' },
        isAllCadre: false,
        cadreIds: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
        isAllState: false,
        stateIds: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
      });

      mockSubscriberModel.find.mockResolvedValue([
        { _id: '6666c830eb18953046b1b56b' },
        { _id: '6666c830eb18953046b1b56b' },
      ]);
      jest.spyOn(service, 'buildQuery');
      const result = await service.sendInitialInvitation(
        mockCGcId,
        mockAdminUserId,
      );

      expect(mockCGcModel.findById).toHaveBeenCalledWith(mockCGcId);
      expect(service.buildQuery).toHaveBeenCalled();
      expect(mockSubscriberModel.find).toHaveBeenCalled();
      expect(mockUserDeviceTokenModel.find).toHaveBeenCalledWith({
        userId: { $in: mockUserIds },
      });

      expect(mockUserNotificationModel.create).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        mockNotificationSaved._id.toString(),
        expect.any(Object),
        mockDeviceTokens,
        'algorithm',
      );

      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: [],
      });
    });

    it('should update diagnosis when no device tokens are found', async () => {
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await service.sendInitialInvitation(mockCGcId, mockAdminUserId);

      expect(mockCGcModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockCGcId,
        { sendInitialNotification: true },
        { new: true },
      );
    });
  });
});
