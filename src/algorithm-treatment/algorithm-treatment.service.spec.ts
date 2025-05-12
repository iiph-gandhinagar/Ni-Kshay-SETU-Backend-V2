import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { AlgorithmTreatmentService } from './algorithm-treatment.service';
jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockTreatmentModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(), // allows chaining `.populate()`
    exec: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Treatment' }), // resolves the final query
  }),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Treatment' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Treatment' }),
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

const mockDiagnosisModel = {
  findOne: jest.fn(),
};

const mockLatentTbModel = {
  findOne: jest.fn(),
};

const mockCgcModel = {
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
describe('AlgorithmTreatmentService', () => {
  let service: AlgorithmTreatmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgorithmTreatmentService,
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
          useValue: mockCgcModel,
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

    service = module.get<AlgorithmTreatmentService>(AlgorithmTreatmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Treatment Algorithm', async () => {
      const createTreatmentDto = {
        id: 1,
        nodeType: 'Node Type',
        isExpandable: false,
        hasOptions: false,
        masterNodeId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        timeSpent: '20',
        index: 1,
        stateIds: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllState: false,
        cadreType: ['State_Level'],
        cadreIds: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllCadre: false,
        title: { en: 'Treatment Algorithm' },
        icon: 'icon',
        description: { en: 'Treatment Algorithm Description' },
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
      const mockTreatment = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createTreatmentDto,
      };
      mockTreatmentModel.create.mockResolvedValue(mockTreatment);

      const result = await service.create(createTreatmentDto);
      expect(mockTreatmentModel.create).toHaveBeenCalledWith(
        createTreatmentDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Treatment Algorithm Created successfully',
        data: mockTreatment,
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
      const mockTreatmentAlgo = [
        { name: 'Treatment Algo 1' },
        { name: 'Treatment Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockTreatmentAlgo);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockTreatmentModel,
        paginationDto,
        [
          { path: 'stateIds', select: 'title' },
          { path: 'cadreIds', select: 'title' },
        ],
        mockQuery,
      );
      expect(result).toEqual(mockTreatmentAlgo);
    });
  });

  describe('findOne', () => {
    it('should return a Treatment by ID', async () => {
      const mockTreatment = { _id: '1', name: 'Test Treatment' };
      mockTreatmentModel.findById.mockReturnValue(mockTreatment);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Treatment Algorithm fetch successfully',
        data: mockTreatment,
      });
      expect(mockTreatmentModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Treatment not found', async () => {
      mockTreatmentModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Treatment Algorithm fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Treatment', async () => {
      const updatedTreatment = { _id: '1', nodeType: 'Updated Treatment' };
      mockTreatmentModel.findByIdAndUpdate.mockResolvedValue(updatedTreatment);

      const result = await service.update('1', {
        nodeType: 'Updated Treatment',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Treatment Algorithm updated successfully',
        data: updatedTreatment,
      });
      expect(mockTreatmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { nodeType: 'Updated Treatment' },
        { new: true },
      );
    });
  });
  describe('remove', () => {
    it('should delete a Treatment Algorithm by ID', async () => {
      mockTreatmentModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockTreatmentModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Treatment Algorithm deleted successfully',
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

      mockTreatmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(rootNode),
      });

      (service as any).fetchDescendants = jest
        .fn()
        .mockResolvedValue(mockChildren);

      const result = await service.getChild(rootNodeId, lang);

      expect(mockTreatmentModel.findById).toHaveBeenCalledWith(rootNodeId);
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
      mockTreatmentModel.findById.mockReturnValue({
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

      mockTreatmentModel.findById.mockReturnValue({
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

      mockTreatmentModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNodes();

      expect(mockTreatmentModel.find).toHaveBeenCalledWith({ parentId: null });

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

      mockTreatmentModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNode('userId123', 'en');
      expect(mockTreatmentModel.find).toHaveBeenCalled();
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

      mockTreatmentModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(rootNodes),
      });

      mockTreatmentModel.findById.mockImplementation(() => ({
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

      expect(mockTreatmentModel.find).toHaveBeenCalledWith({
        activated: true,
        parentId: null,
      });

      expect(mockTreatmentModel.findById).toHaveBeenCalledTimes(2);
      expect(service.fetchDescendants).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: expect.any(Array),
      });
    });
  });

  describe('sendInitialInvitation', () => {
    const mockTreatmentId = '6666c830eb18953046b1b56b';
    const mockAdminUserId = '6666c830eb18953046b1b56b';
    const mockUserIds = ['user1', 'user2'];
    const mockDeviceTokens = [
      { notificationToken: 'token1' },
      { notificationToken: 'token2' },
    ];
    const mockNotificationSaved = { _id: 'mockNotificationId' };
    it('should add notification to queue and return response', async () => {
      mockTreatmentModel.findById.mockResolvedValue({
        _id: mockTreatmentId,
        parentId: null,
        title: { en: 'Treatment Title' },
        isAllCadre: false,
        cadreIds: ['cadre1', 'cadre2'],
        isAllState: false,
        stateIds: ['state1', 'state2'],
      });

      mockSubscriberModel.find.mockResolvedValue([
        { _id: 'user1' },
        { _id: 'user2' },
      ]);
      jest.spyOn(service, 'buildQuery');
      const result = await service.sendInitialInvitation(
        mockTreatmentId,
        mockAdminUserId,
      );

      expect(mockTreatmentModel.findById).toHaveBeenCalledWith(mockTreatmentId);
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

    it('should update Treatment when no device tokens are found', async () => {
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      await service.sendInitialInvitation(mockTreatmentId, mockAdminUserId);

      expect(mockTreatmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTreatmentId,
        { sendInitialNotification: true },
        { new: true },
      );
    });
  });
});
