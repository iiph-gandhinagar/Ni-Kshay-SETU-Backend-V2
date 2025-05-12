import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { paginate } from '../common/pagination/pagination.service';
import { DynamicAlgorithmService } from './dynamic-algorithm.service';

jest.mock('../common/pagination/pagination.service', () => ({
  paginate: jest.fn(),
}));

const mockDynamicAlgoModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(), // allows chaining `.populate()`
    exec: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Dynamic' }), // resolves the final query
  }),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Dynamic' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Dynamic' }),
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
const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('DynamicAlgorithmService', () => {
  let service: DynamicAlgorithmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicAlgorithmService,
        {
          provide: getModelToken('DynamicAlgorithm'),
          useValue: mockDynamicAlgoModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },

        { provide: getModelToken('State'), useValue: mockStateModel },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<DynamicAlgorithmService>(DynamicAlgorithmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a Dynamic Algorithm', async () => {
      const createDynamicDto = {
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
        title: { en: 'Dynamic Algorithm' },
        icon: 'icon',
        description: { en: 'Dynamic Algorithm Description' },
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
      const mockDynamic = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createDynamicDto,
      };
      mockDynamicAlgoModel.create.mockResolvedValue(mockDynamic);

      const result = await service.create(createDynamicDto);
      expect(mockDynamicAlgoModel.create).toHaveBeenCalledWith(
        createDynamicDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo Created successfully',
        data: mockDynamic,
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
      const mockDynamicAlgo = [
        { name: 'Dynamic Algo 1' },
        { name: 'Dynamic Algo 2' },
      ];

      mockFilterService.filter.mockResolvedValue(mockQuery);
      (paginate as jest.Mock).mockResolvedValue(mockDynamicAlgo);

      const result = await service.findAll(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(paginate).toHaveBeenCalledWith(
        mockDynamicAlgoModel,
        paginationDto,
        [
          { path: 'stateIds', select: 'title' },
          { path: 'cadreIds', select: 'title' },
        ],
        mockQuery,
      );
      expect(result).toEqual(mockDynamicAlgo);
    });
  });

  describe('findOne', () => {
    it('should return a Dynamic by ID', async () => {
      const mockDynamic = { _id: '1', name: 'Test Dynamic' };
      mockDynamicAlgoModel.findById.mockReturnValue(mockDynamic);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo fetch successfully',
        data: mockDynamic,
      });
      expect(mockDynamicAlgoModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Dynamic not found', async () => {
      mockDynamicAlgoModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo fetch successfully',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated Dynamic', async () => {
      const updatedDynamic = { _id: '1', nodeType: 'Updated Dynamic' };
      mockDynamicAlgoModel.findByIdAndUpdate.mockResolvedValue(updatedDynamic);

      const result = await service.update('1', {
        nodeType: 'Updated Dynamic',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo updated successfully',
        data: updatedDynamic,
      });
      expect(mockDynamicAlgoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { nodeType: 'Updated Dynamic' },
        { new: true },
      );
    });
  });
  describe('remove', () => {
    it('should delete a Dynamic Algorithm by ID', async () => {
      mockDynamicAlgoModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove('1');

      expect(mockDynamicAlgoModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Dynamic Algo deleted successfully',
        data: [],
      });
    });
  });

  describe('getChild', () => {
    const mockRootNodeId = 'root123';
    const mockLang = 'en';

    const mockRootNode = {
      _id: mockRootNodeId,
      title: 'Root Node Title',
      description: 'Root Node Description',
      children: [],
    };
    it('should return child nodes of a root node', async () => {
      const mockDescendants = [{ _id: '456', title: 'Child 1' }];

      const mockChildren = [{ _id: '456', title: 'Child 1' }];

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockRootNode);

      mockDynamicAlgoModel.findById = jest.fn().mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      (service as any).fetchDescendants = jest
        .fn()
        .mockResolvedValue(mockChildren);

      mockBaseResponse.sendResponse.mockReturnValue({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: mockRootNodeId,
          title: mockRootNode.title,
          description: mockRootNode.description,
          children: mockDescendants,
        },
      });

      const result = await service.getChild(mockRootNodeId, mockLang);

      expect(mockDynamicAlgoModel.findById).toHaveBeenCalledWith(
        mockRootNodeId,
      );
      expect(populateMock).toHaveBeenCalledWith('children');
      expect(execMock).toHaveBeenCalled();
      expect(service.fetchDescendants).toHaveBeenCalledWith(
        mockRootNode,
        mockLang,
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'List of Dependent Nodes!!',
        {
          _id: mockRootNodeId,
          title: mockRootNode.title,
          description: mockRootNode.description,
          children: mockDescendants,
        },
      );
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: mockRootNodeId,
          title: mockRootNode.title,
          description: mockRootNode.description,
          children: mockDescendants,
        },
      });
    });

    it('should return empty array if root node is not found', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(null);

      mockDynamicAlgoModel.findById = jest.fn().mockReturnValue({
        populate: populateMock,
        exec: execMock,
      });

      const result = await service.getChild(mockRootNodeId, mockLang);

      expect(result).toEqual([]);
    });
  });

  describe('getMasterNodes', () => {
    it('should return master nodes with status 200', async () => {
      const algoId = '6666c830eb18953046b1b56b';
      const mockNodes = [
        { _id: '1', title: { en: 'Node 1' } },
        { _id: '2', title: { en: 'Node 2' } },
      ];

      mockDynamicAlgoModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNodes(algoId);

      expect(mockDynamicAlgoModel.find).toHaveBeenCalledWith({
        algoId: new mongoose.Types.ObjectId(algoId),
        activated: true,
        parentId: null,
      });

      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: 'root123',
          title: 'Root Node Title',
          description: 'Root Node Description',
          children: [
            {
              _id: '456',
              title: 'Child 1',
            },
          ],
        },
      });
    });
  });

  describe('getMasterNode', () => {
    const mockUserId = '6666c830eb18953046b1b56b';
    const mockLang = 'en';
    const mockAlgoId = '6666c830eb18953046b1b56b';

    const mockUserWithState = {
      _id: mockUserId,
      stateId: '6666c830eb18953046b1b56b',
      cadreId: '6666c830eb18953046b1b56b',
    };

    const mockUserWithoutState = {
      _id: mockUserId,
      stateId: null,
      cadreId: '6666c830eb18953046b1b56b',
    };

    const mockNodes = [
      { _id: 'node1', title: 'Master Node 1' },
      { _id: 'node2', title: 'Master Node 2' },
    ];
    it('should return master nodes when user has stateId', async () => {
      const selectMock = jest.fn().mockResolvedValue(mockUserWithState);
      mockSubscriberModel.findById = jest
        .fn()
        .mockReturnValue({ select: selectMock });

      mockDynamicAlgoModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNode(
        mockUserId,
        mockLang,
        mockAlgoId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(selectMock).toHaveBeenCalledWith('stateId cadreId');
      expect(mockDynamicAlgoModel.find).toHaveBeenCalledWith({
        activated: true,
        parentId: null,
        algoId: new mongoose.Types.ObjectId(mockAlgoId),
        $or: [
          {
            cadreIds: {
              $in: [mockUserWithoutState.cadreId],
            },
          },
          { isAllCadre: true },
        ],
      });
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: 'root123',
          title: 'Root Node Title',
          description: 'Root Node Description',
          children: [
            {
              _id: '456',
              title: 'Child 1',
            },
          ],
        },
      });
    });

    it('should return master nodes when user has no stateId', async () => {
      const selectMock = jest.fn().mockResolvedValue(mockUserWithoutState);
      mockSubscriberModel.findById = jest
        .fn()
        .mockReturnValue({ select: selectMock });

      mockDynamicAlgoModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNodes),
      });

      const result = await service.getMasterNode(
        mockUserId,
        mockLang,
        mockAlgoId,
      );

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(selectMock).toHaveBeenCalledWith('stateId cadreId');
      expect(mockDynamicAlgoModel.find).toHaveBeenCalledWith({
        activated: true,
        parentId: null,
        algoId: new mongoose.Types.ObjectId(mockAlgoId),
        $and: [
          {
            $or: [{ stateIds: { $in: [null] } }, { isAllState: true }],
          },
          {
            $or: [
              { cadreIds: { $in: ['6666c830eb18953046b1b56b'] } },
              { isAllCadre: true },
            ],
          },
        ],
      });
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: {
          _id: 'root123',
          title: 'Root Node Title',
          description: 'Root Node Description',
          children: [
            {
              _id: '456',
              title: 'Child 1',
            },
          ],
        },
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

      mockDynamicAlgoModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(rootNodes),
      });

      mockDynamicAlgoModel.findById.mockImplementation(() => ({
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

      expect(mockDynamicAlgoModel.find).toHaveBeenCalledWith({
        activated: true,
        parentId: null,
      });

      expect(mockDynamicAlgoModel.findById).toHaveBeenCalledTimes(2);
      expect(service.fetchDescendants).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        status: 200,
        message: 'List of Dependent Nodes!!',
        data: expect.any(Array),
      });
    });
  });
});
