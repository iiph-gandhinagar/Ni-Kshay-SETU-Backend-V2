import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { paginate } from '../common/pagination/pagination.service';
import { ResourceMaterialService } from './resource-material.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockResourceMaterialModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Resource material' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Resource material' }),
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

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

const mockLanguageTranslation = {
  getSymptomTranslatedFields: jest.fn(),
};

const mockFirebaseService = {
  getTranslatedFields: jest.fn(),
};

const mockNotificationQueueService = {
  addNotificationToQueue: jest.fn(),
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

const mockStateModel = {
  findOne: jest.fn(),
};

const mockCadreModel = {
  findOne: jest.fn(),
};

const mockCountryModel = {
  findOne: jest.fn(),
};
describe('ResourceMaterialService', () => {
  let service: ResourceMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceMaterialService,
        {
          provide: getModelToken('ResourceMaterial'),
          useValue: mockResourceMaterialModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: getModelToken('Country'), useValue: mockCountryModel },
        {
          provide: getModelToken('UserDeviceToken'),
          useValue: mockUserDeviceTokenModel,
        },
        {
          provide: getModelToken('UserNotification'),
          useValue: mockUserNotificationModel,
        },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        { provide: AdminService, useValue: mockAdminService },
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

    service = module.get<ResourceMaterialService>(ResourceMaterialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Resource material Algorithm', async () => {
      const createResourceMaterialDto = {
        countryId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        stateId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllState: false,
        cadreId: [new mongoose.Types.ObjectId('6666c830eb18953046b1b56b')],
        isAllCadre: false,
        title: { en: 'Resource material' },
        typeOfMaterials: 'pdf',
        iconType: 'icon',
        parentId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        index: 1,
        createdBy: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        relatedMaterials: ['material 1', 'material 2'],
      };
      const mockResourceMaterial = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createResourceMaterialDto,
      };
      mockResourceMaterialModel.create.mockResolvedValue(mockResourceMaterial);

      const result = await service.create(
        createResourceMaterialDto,
        '6666c830eb18953046b1b56b',
      );
      expect(mockResourceMaterialModel.create).toHaveBeenCalledWith(
        createResourceMaterialDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material Created successfully',
        data: mockResourceMaterial,
      });
    });
  });

  describe('findAll', () => {
    const mockPaginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      fromDate: '',
      toDate: '',
    };
    const mockUserId = '64b7f3d7c8637a29f4e1a41c';
    const mockQuery = { some: 'query' };
    const mockUpdatedQuery = { some: 'filtered-query' };
    const mockResourceMaterial = [
      { title: 'Resource material Algo 1' },
      { title: 'Resource material Algo 2' },
    ];

    it('should return paginated resource materials with population', async () => {
      // Mock filter
      mockFilterService.filter.mockResolvedValue(mockQuery);

      // Mock role filter
      mockAdminService.adminRoleFilter.mockResolvedValue(mockUpdatedQuery);

      (paginate as jest.Mock).mockResolvedValue(mockResourceMaterial);

      const result = await service.findAll(mockPaginationDto, mockUserId);

      expect(mockFilterService.filter).toHaveBeenCalledWith(mockPaginationDto);

      expect(mockAdminService.adminRoleFilter).toHaveBeenCalledWith(
        mockUserId,
        mockQuery,
        'resource-material',
      );

      expect(paginate).toHaveBeenCalledWith(
        mockResourceMaterialModel,
        mockPaginationDto,
        [
          { path: 'countryId', select: 'title' },
          { path: 'stateId', select: 'title' },
          { path: 'cadreId', select: 'title' },
        ],
        mockUpdatedQuery,
      );

      expect(result).toEqual(mockResourceMaterial);
    });
  });

  describe('findOne', () => {
    it('should return a Resource material by ID', async () => {
      const mockResourceMaterial = {
        _id: '1',
        title: 'Test Resource material',
      };
      mockResourceMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResourceMaterial),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: mockResourceMaterial,
      });
      expect(mockResourceMaterialModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Resource material not found', async () => {
      mockResourceMaterialModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Resource material', async () => {
      const updatedDiagnosis = {
        _id: '1',
        iconType: 'Updated Resource Material',
      };
      mockResourceMaterialModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockReturnValue(updatedDiagnosis),
      });

      const result = await service.update('1', {
        iconType: 'Updated Resource Material',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material updated successfully',
        data: updatedDiagnosis,
      });
      expect(mockResourceMaterialModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { iconType: 'Updated Resource Material' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Resource Material by ID', async () => {
      mockResourceMaterialModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockResourceMaterialModel.findByIdAndDelete).toHaveBeenCalledWith(
        '1',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material deleted successfully',
        data: [],
      });
    });
  });

  describe('getAllMaterials', () => {
    const mockUserId = '6666c830eb18953046b1b56b';
    const mockLang = 'en';
    const mockFilter = 'name';
    const mockParentId = '6666c830eb18953046b1b56b';

    const mockUser = {
      _id: mockUserId,
      cadreId: '6666c830eb18953046b1b56b',
      stateId: '6666c830eb18953046b1b56b',
      phoneNo: '1234567890',
      name: 'Test User',
      countryId: '6666c830eb18953046b1b56b',
      cadreType: 'health',
    };

    const mockDocs = [
      {
        _id: 'doc1',
        title: { en: 'Document Title' },
        typeOfMaterials: 'PDF',
        parentId: mockParentId,
        iconType: 'pdf',
        index: 1,
        createdBy: '6666c830eb18953046b1b56b',
        relatedMaterials: [],
      },
    ];

    const translatedFields = {
      title: 'Translated Title',
    };

    const finalDocs = [
      {
        ...mockDocs[0],
        ...translatedFields,
      },
    ];
    it('should return all materials with translations and sorted by name', async () => {
      mockSubscriberModel.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(service, 'buildResourceMaterialQuery');

      mockResourceMaterialModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      } as any);

      mockLanguageTranslation.getSymptomTranslatedFields.mockResolvedValue(
        translatedFields,
      );

      const result = await service.getAllMaterials(
        mockLang,
        mockUserId,
        mockFilter,
        mockParentId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(service.buildResourceMaterialQuery).toHaveBeenCalledWith(
        mockUser,
        mockParentId,
      );
      expect(mockResourceMaterialModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.any(Array),
          $or: expect.any(Array),
        }),
      );
      expect(
        mockLanguageTranslation.getSymptomTranslatedFields,
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: finalDocs,
      });
    });
  });

  describe('getAllMaterial', () => {
    it('should return all materials with populated fields and sorted by name', async () => {
      const lang = 'en';
      const filter = 'name';
      const parentId = '123';
      const mockData = [
        {
          _id: '1',
          title: { en: 'Material A' },
          parentId: '123',
        },
      ];

      const findQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockData),
      };

      mockResourceMaterialModel.find.mockReturnValue(findQuery);

      const result = await service.getAllMaterial(lang, filter, parentId);

      expect(mockResourceMaterialModel.find).toHaveBeenCalledWith({ parentId });
      expect(findQuery.populate).toHaveBeenCalledWith([
        { path: 'countryId', select: 'title' },
        { path: 'stateId', select: 'title' },
        { path: 'cadreId', select: 'title' },
      ]);
      expect(findQuery.sort).toHaveBeenCalledWith({ name: -1 });
      expect(findQuery.lean).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: mockData,
      });
    });

    it('should sort by date when filter is "date"', async () => {
      const lang = 'en';
      const filter = 'date';
      const parentId = '456';
      const mockData = [];

      const findQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockData),
      };

      mockResourceMaterialModel.find.mockReturnValue(findQuery);

      const result = await service.getAllMaterial(lang, filter, parentId);

      expect(mockResourceMaterialModel.find).toHaveBeenCalledWith({ parentId });
      expect(findQuery.populate).toHaveBeenCalledWith([
        { path: 'countryId', select: 'title' },
        { path: 'stateId', select: 'title' },
        { path: 'cadreId', select: 'title' },
      ]);
      expect(findQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(findQuery.lean).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: mockData,
      });
    });
  });

  describe('getAllDescendants', () => {
    it('should return descendants of a valid root node', async () => {
      const rootNodeId = 'root123';
      const lang = 'en';

      const mockRootNode = {
        _id: rootNodeId,
        title: { en: 'Root Title' },
        children: [{ _id: 'child1' }],
      };

      const mockChildren = [
        {
          _id: 'child1',
          title: { en: 'Child 1' },
        },
      ];

      mockResourceMaterialModel.findById.mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRootNode) }),
      });

      (service as any).fetchDescendants = jest
        .fn()
        .mockResolvedValue(mockChildren);

      const result = await service.getAllDescendants(rootNodeId, lang);

      expect(mockResourceMaterialModel.findById).toHaveBeenCalledWith(
        rootNodeId,
      );

      expect(service.fetchDescendants).toHaveBeenCalledWith(mockRootNode, lang);
      expect(result).toEqual({
        statusCode: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: mockRootNode._id,
          title: mockRootNode.title,
          children: mockChildren,
        },
      });
    });

    it('should return an empty array if root node is not found', async () => {
      const rootNodeId = 'invalidId';
      const lang = 'en';
      mockResourceMaterialModel.findById.mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      });

      const result = await service.getAllDescendants(rootNodeId, lang);

      expect(result).toEqual([]);
    });
  });
  describe('rootFolders', () => {
    it('should return translated root folders', async () => {
      const lang = 'en';

      const mockDocs = [
        {
          toObject: () => ({
            _id: 'folder1',
            title: { en: 'Folder 1' },
            typeOfMaterials: 'folder',
            index: 1,
            iconType: 'folder',
            relatedMaterials: [],
          }),
        },
      ];

      const translatedFields = {
        title: 'Translated Folder 1',
      };

      const mockCursor = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockDocs),
      };

      mockResourceMaterialModel.find.mockReturnValue(mockCursor);
      mockLanguageTranslation.getSymptomTranslatedFields.mockResolvedValue(
        translatedFields,
      );

      const result = await service.rootFolders(lang);

      expect(mockResourceMaterialModel.find).toHaveBeenCalledWith({
        parentId: null,
        typeOfMaterials: 'folder',
        'title.en': { $ne: '' },
      });
      expect(
        mockLanguageTranslation.getSymptomTranslatedFields,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: [
          {
            _id: 'folder1',
            title: 'Translated Folder 1',
            typeOfMaterials: 'folder',
            index: 1,
            iconType: 'folder',
            relatedMaterials: [],
          },
        ],
      });
    });

    it('should default lang to "en" if not provided', async () => {
      const mockDocs: any[] = [];
      mockResourceMaterialModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockDocs),
      });

      const result = await service.rootFolders(null);

      expect(mockResourceMaterialModel.find).toHaveBeenCalledWith({
        parentId: null,
        typeOfMaterials: 'folder',
        'title.en': { $ne: '' },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Resource Material fetch successfully',
        data: [],
      });
    });
  });

  describe('sendInitialInvitation', () => {
    it('should send notification and queue it when device tokens exist', async () => {
      const resourceId = '6666c830eb18953046b1b56b';
      const adminUserId = '6666c830eb18953046b1b56b';
      const resource = {
        _id: resourceId,
        title: { en: 'Test Resource' },
        parentId: '6666c830eb18953046b1b56b',
      };
      const mockQuery = { cadreId: 'someCadre' };
      const users = [
        { _id: '6666c830eb18953046b1b56b' },
        { _id: '6666c830eb18953046b1b56b' },
      ];
      const deviceTokens = [{ notificationToken: 'token1' }];
      const parentResource = {
        title: { en: 'Parent Title' },
        typeOfMaterial: 'folder',
      };
      const notificationDoc = { _id: '6666c830eb18953046b1b56b' };

      jest.spyOn(service, 'buildQuery').mockResolvedValue(mockQuery);
      mockResourceMaterialModel.findById.mockResolvedValue(resource);
      mockSubscriberModel.find.mockResolvedValue(users);
      mockUserDeviceTokenModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue(deviceTokens),
      });
      mockResourceMaterialModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(parentResource),
      });
      mockUserNotificationModel.create.mockResolvedValue(notificationDoc);
      const result = await service.sendInitialInvitation(
        resourceId,
        adminUserId,
      );

      expect(mockResourceMaterialModel.findById).toHaveBeenCalledWith(
        resourceId,
      );
      expect(service.buildQuery).toHaveBeenCalledWith(resource);
      expect(mockSubscriberModel.find).toHaveBeenCalledWith(mockQuery);
      expect(mockUserDeviceTokenModel.find).toHaveBeenCalledWith({
        userId: {
          $in: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
        },
      });
      expect(mockResourceMaterialModel.findOne).toHaveBeenCalledWith({
        parentId: '6666c830eb18953046b1b56b',
      });
      expect(mockUserNotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Resource Material Added',
          description: 'Test Resource',
          userId: ['6666c830eb18953046b1b56b', '6666c830eb18953046b1b56b'],
          type: 'Automatic Notification',
        }),
      );
      expect(
        mockNotificationQueueService.addNotificationToQueue,
      ).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
        expect.any(Object),
        deviceTokens,
        'resourceMaterial',
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Notifications are in Queue!!',
        data: [],
      });
    });
  });
});
