import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateDynamicAlgorithmDto } from './dto/create-dynamic-algorithm.dto';
import { UpdateDynamicAlgorithmDto } from './dto/update-dynamic-algorithm.dto';
import { DynamicAlgorithmDocument } from './entities/dynamic-algorithm.entity';

@Injectable()
export class DynamicAlgorithmService {
  constructor(
    @InjectModel('DynamicAlgorithm')
    private readonly dynamicModel: Model<DynamicAlgorithmDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<DynamicAlgorithmDocument> {
    console.log('inside find by property Algorithm Dynamic----->');
    return this.dynamicModel.findOne({ [property]: value }).exec();
  }

  async create(createDynamicAlgorithmDto: CreateDynamicAlgorithmDto) {
    console.log('This action adds a new Algorithm Dynamic');
    if (createDynamicAlgorithmDto.stateIds) {
      createDynamicAlgorithmDto.stateIds =
        createDynamicAlgorithmDto.stateIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    if (createDynamicAlgorithmDto.cadreIds) {
      createDynamicAlgorithmDto.cadreIds =
        createDynamicAlgorithmDto.cadreIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    if (createDynamicAlgorithmDto.parentId) {
      createDynamicAlgorithmDto.parentId = new mongoose.Types.ObjectId(
        createDynamicAlgorithmDto.parentId,
      );
    }
    if (createDynamicAlgorithmDto.redirectNodeId) {
      createDynamicAlgorithmDto.redirectNodeId = new mongoose.Types.ObjectId(
        createDynamicAlgorithmDto.redirectNodeId,
      );
    }
    if (createDynamicAlgorithmDto.masterNodeId) {
      createDynamicAlgorithmDto.masterNodeId = new mongoose.Types.ObjectId(
        createDynamicAlgorithmDto.masterNodeId,
      );
    }
    if (createDynamicAlgorithmDto.algoId) {
      createDynamicAlgorithmDto.algoId = new mongoose.Types.ObjectId(
        createDynamicAlgorithmDto.algoId,
      );
    }
    console.log(
      'createDynamicAlgorithmDto',
      createDynamicAlgorithmDto,
      typeof createDynamicAlgorithmDto.title,
    );
    createDynamicAlgorithmDto.title = JSON.parse(
      JSON.stringify(createDynamicAlgorithmDto.title),
    );
    const newDynamic = await this.dynamicModel.create(
      createDynamicAlgorithmDto,
    );
    // const dynamic = await newDynamic.save();
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgo.DYNAMIC_ALGO_CREATED,
      newDynamic,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all algorithm Dynamic');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'stateIds', select: 'title' }, // Populate stateId and select only the name field
      { path: 'cadreIds', select: 'title' }, // Populate districtId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.dynamicModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Algorithm Dynamic`);
    const getDiagnosisById = await this.dynamicModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgo.DYNAMIC_ALGO_LIST,
      getDiagnosisById,
    );
  }

  async update(
    id: string,
    updateDynamicAlgorithmDto: UpdateDynamicAlgorithmDto,
  ) {
    console.log(`This action updates a #${id} Algorithm Dynamic`);
    if (updateDynamicAlgorithmDto.stateIds) {
      updateDynamicAlgorithmDto.stateIds =
        updateDynamicAlgorithmDto.stateIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    if (updateDynamicAlgorithmDto.cadreIds) {
      updateDynamicAlgorithmDto.cadreIds =
        updateDynamicAlgorithmDto.cadreIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    if (updateDynamicAlgorithmDto.parentId) {
      updateDynamicAlgorithmDto.parentId = new mongoose.Types.ObjectId(
        updateDynamicAlgorithmDto.parentId,
      );
    }
    if (updateDynamicAlgorithmDto.redirectNodeId) {
      updateDynamicAlgorithmDto.redirectNodeId = new mongoose.Types.ObjectId(
        updateDynamicAlgorithmDto.redirectNodeId,
      );
    }
    if (updateDynamicAlgorithmDto.masterNodeId) {
      updateDynamicAlgorithmDto.masterNodeId = new mongoose.Types.ObjectId(
        updateDynamicAlgorithmDto.masterNodeId,
      );
    }
    if (updateDynamicAlgorithmDto.algoId) {
      updateDynamicAlgorithmDto.algoId = new mongoose.Types.ObjectId(
        updateDynamicAlgorithmDto.algoId,
      );
    }
    const updateDetails = await this.dynamicModel.findByIdAndUpdate(
      id,
      updateDynamicAlgorithmDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgo.DYNAMIC_ALGO_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Algorithm Dynamic`);
    await this.dynamicModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.dynamicAlgo.DYNAMIC_ALGO_DELETE,
      [],
    );
  }

  async getChild(rootNodeId: string, lang: string) {
    console.log(`This Action return child of rootNode ${rootNodeId}`);
    if (!lang) {
      lang = 'en';
    }
    // Fetch the root node and its immediate children
    const rootNode = await this.dynamicModel
      .findById(rootNodeId)
      .populate('children')
      .exec();
    if (!rootNode) {
      return [];
    }

    const children = await this.fetchDescendants(rootNode, lang);
    const nodeDetails = {
      _id: rootNode._id,
      title: rootNode.title,
      description: rootNode.description,
      children: children,
    };
    return this.baseResponse.sendResponse(
      200,
      'List of Dependent Nodes!!',
      nodeDetails,
    );
  }

  async getMasterNode(userId: string, lang: string, algoId: string) {
    console.log(`This action return master Nodes Details to Subscriber`);
    if (!lang) {
      lang = 'en';
    }
    console.log('get master node service -->');
    const user = await this.subscriberModel
      .findById(userId)
      .select('stateId cadreId');
    let nodes;
    if (user.stateId) {
      nodes = await this.dynamicModel
        .find({
          activated: true,
          parentId: null,
          algoId: new mongoose.Types.ObjectId(algoId),
          $or: [{ cadreIds: { $in: [user.cadreId] } }, { isAllCadre: true }],
        })
        .exec();
    } else {
      nodes = await this.dynamicModel
        .find({
          activated: true,
          parentId: null,
          algoId: new mongoose.Types.ObjectId(algoId),
          $and: [
            {
              $or: [
                { stateIds: { $in: [user.stateId] } },
                { isAllState: true },
              ],
            },
            {
              $or: [
                { cadreIds: { $in: [user.cadreId] } },
                { isAllCadre: true },
              ],
            },
          ],
        })
        .exec();
    }
    return this.baseResponse.sendResponse(200, 'List of Master Nodes', nodes);
  }

  async getMasterNodes(algoId: string) {
    console.log(`This action return all Master Nodes details to Admin user`);
    const nodes = await this.dynamicModel
      .find({
        algoId: new mongoose.Types.ObjectId(algoId),
        activated: true,
        parentId: null,
      })
      .exec();
    // return nodes;
    return this.baseResponse.sendResponse(200, 'List of Master Nodes', nodes);
  }

  async getAllDescendants(lang: string) {
    console.log(
      `This Action return all rootNode with its child language --> ${lang}`,
    );
    if (!lang) {
      lang = 'en';
    }
    // Fetch the root node and its immediate children
    const masterNodes = await this.dynamicModel
      .find({
        activated: true,
        parentId: null,
      })
      .exec();
    const nodeDetailsArray = await Promise.all(
      masterNodes.map(async (item) => {
        const rootNode = await this.dynamicModel
          .findById(item._id)
          .populate('children') // populate all children at once
          .exec();

        if (!rootNode) return null; // Handle null cases

        const children = await this.fetchDescendants(rootNode, lang);

        return {
          _id: rootNode._id,
          title: rootNode.title,
          description: rootNode.description,
          children: children,
        };
      }),
    );
    const filteredNodeDetails = nodeDetailsArray.filter(
      (node) => node !== null,
    );
    return this.baseResponse.sendResponse(
      200,
      'List of Dependent Nodes!!',
      filteredNodeDetails,
    );
  }
  async fetchDescendants(
    node: DynamicAlgorithmDocument,
    lang: string = 'en',
  ): Promise<DynamicAlgorithmDocument[]> {
    // Fetch the immediate children of the given node
    const children = await this.dynamicModel
      .find({ parentId: node._id })
      .lean() // Use .lean() to fetch plain JavaScript objects if necessary
      .exec();

    // Cast each child to DynamicAlgorithmDocument type
    const typedChildren = children.map(
      (child) =>
        ({
          ...child,
          children: [], // Initialize children as an empty array
        }) as DynamicAlgorithmDocument,
    );

    // Recursively fetch descendants for each child
    for (const child of typedChildren) {
      child.children = await this.fetchDescendants(child, lang);
    }

    return typedChildren;
  }

  async scriptDiagnosisAlgorithm() {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/diagnoses_algorithms.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      if (!record.deleted_at) {
        const diagnosisId = await this.dynamicModel
          .findOne({
            id: record.parent_id,
          })
          .select('_id');

        const masterId = await this.dynamicModel
          .findOne({
            id: record.master_node_id,
          })
          .select('_id');
        const stateIds =
          record.state_id &&
          record.state_id !== '[]' &&
          record.state_id !== '' &&
          record.state_id.Length !== 0
            ? record.state_id.split(',')
            : [];
        const cadreIds =
          record.cadre_id &&
          record.cadre_id !== '[]' &&
          record.cadre_id !== '' &&
          record.cadre_id.Length !== 0
            ? record.cadre_id.split(',')
            : [];
        const state = await this.stateModel
          .find({ id: { $in: stateIds } })
          .select('_id title')
          .then((states) => states.map((state) => state._id));
        const cadre = await this.cadreModel
          .find({ id: { $in: cadreIds } })
          .select('_id title')
          .then((cadres) => cadres.map((cadre) => cadre._id));
        if (diagnosisId) {
          record.parentId = diagnosisId._id;
          record.masterNodeId = masterId !== null ? masterId?._id : null;
          record.stateIds = state;
          record.cadreIds = cadre;
        } else {
          record.parentId = null;
          record.masterNodeId = masterId !== null ? masterId?._id : null;
          record.stateIds = state;
          record.cadreIds = cadre;
        }
        record.title = record.title ? JSON.parse(record.title) : '';
        record.description = record.description
          ? JSON.parse(record.description)
          : '';
        record.header = record.header ? JSON.parse(record.header) : '';
        record.subHeader = record.sub_header
          ? JSON.parse(record.sub_header)
          : '';
        record.nodeType = record.node_type;
        record.isExpandable = record.is_expandable;
        record.hasOptions = record.has_options;
        record.timeSpent = record.time_spent;
        record.redirectAlgoType = record.redirect_algo_type;
        record.redirectNodeId = record.redirect_node_id;
        record.sendInitialNotification = record.send_initial_notification;
        record.createdAt = new Date(record.created_at);
        record.updatedAt = new Date(record.updated_at);
        record.deletedAt = record.deleted_at ? new Date(record.deleted_at) : '';
      }
    }
    return true;
  }
}
