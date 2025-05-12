import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareDocument } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionDocument } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionDocument } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentDocument } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { CreateAlgorithmCgcInterventionDto } from './dto/create-algorithm-cgc-intervention.dto';
import { UpdateAlgorithmCgcInterventionDto } from './dto/update-algorithm-cgc-intervention.dto';
import { AlgorithmCgcInterventionDocument } from './entities/algorithm-cgc-intervention.entity';
dotenv.config();

@Injectable()
export class AlgorithmCgcInterventionService {
  constructor(
    @InjectModel('AlgorithmCgcIntervention')
    private readonly cgcInterventionModel: Model<AlgorithmCgcInterventionDocument>,
    @InjectModel('AlgorithmDiagnosis')
    private readonly diagnosisModel: Model<AlgorithmDiagnosisDocument>,
    @InjectModel('AlgorithmDifferentialCare')
    private readonly differentialCareModel: Model<AlgorithmDifferentialCareDocument>,
    @InjectModel('AlgorithmGuidanceOnAdverseDrugReaction')
    private readonly guidanceOnAdrModel: Model<AlgorithmGuidanceOnAdverseDrugReactionDocument>,
    @InjectModel('AlgorithmTreatment')
    private readonly treatmentModel: Model<AlgorithmTreatmentDocument>,
    @InjectModel('AlgorithmLatentTbInfection')
    private readonly latentTbModel: Model<AlgorithmLatentTbInfectionDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
    @Inject(forwardRef(() => LanguageTranslation))
    private readonly languageTranslation: LanguageTranslation,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AlgorithmCgcInterventionDocument> {
    console.log('inside find by property Algorithm CGC Intervention----->');
    return this.cgcInterventionModel.findOne({ [property]: value }).exec();
  }
  async create(
    createAlgorithmCgcInterventionDto: CreateAlgorithmCgcInterventionDto,
  ) {
    console.log('This action adds a new Algorithm CGC Intervention');
    if (createAlgorithmCgcInterventionDto.stateIds) {
      createAlgorithmCgcInterventionDto.stateIds =
        createAlgorithmCgcInterventionDto.stateIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    if (createAlgorithmCgcInterventionDto.cadreIds) {
      createAlgorithmCgcInterventionDto.cadreIds =
        createAlgorithmCgcInterventionDto.cadreIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }

    if (createAlgorithmCgcInterventionDto.parentId) {
      createAlgorithmCgcInterventionDto.parentId = new mongoose.Types.ObjectId(
        createAlgorithmCgcInterventionDto.parentId,
      );
    }
    if (createAlgorithmCgcInterventionDto.redirectNodeId) {
      createAlgorithmCgcInterventionDto.redirectNodeId =
        new mongoose.Types.ObjectId(
          createAlgorithmCgcInterventionDto.redirectNodeId,
        );
    }
    if (createAlgorithmCgcInterventionDto.masterNodeId) {
      createAlgorithmCgcInterventionDto.masterNodeId =
        new mongoose.Types.ObjectId(
          createAlgorithmCgcInterventionDto.masterNodeId,
        );
    }
    const newCgcIntervention = await this.cgcInterventionModel.create(
      createAlgorithmCgcInterventionDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.cgcInterventionAlgorithm.CGC_INTERVENTION_ALGORITHM_CREATED,
      newCgcIntervention,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Algorithm CGC Intervention');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'stateIds', select: 'title' }, // Populate stateId and select only the name field
      { path: 'cadreIds', select: 'title' }, // Populate districtId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.cgcInterventionModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Algorithm CGC Intervention`);
    const getCgcInterventionById = await this.cgcInterventionModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.cgcInterventionAlgorithm.CGC_INTERVENTION_ALGORITHM_LIST,
      getCgcInterventionById,
    );
  }

  async update(
    id: string,
    updateAlgorithmCgcInterventionDto: UpdateAlgorithmCgcInterventionDto,
  ) {
    console.log(`This action updates a #${id} Algorithm CGC Intervention`);
    const updateDetails = await this.cgcInterventionModel.findByIdAndUpdate(
      id,
      updateAlgorithmCgcInterventionDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.cgcInterventionAlgorithm.CGC_INTERVENTION_ALGORITHM_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Algorithm CGC Intervention`);
    await this.cgcInterventionModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.cgcInterventionAlgorithm.CGC_INTERVENTION_ALGORITHM_DELETE,
      [],
    );
  }

  async getMasterNode(userId: string, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('get master node service -->');
    const user = await this.subscriberModel
      .findById(userId)
      .select('stateId cadreId')
      .lean(true);
    let nodes;
    if (user.stateId) {
      nodes = await this.cgcInterventionModel
        .find({
          activated: true,
          parentId: null,
          $or: [{ cadreIds: { $in: [user.cadreId] } }, { isAllCadre: true }],
        })
        .exec();
    } else {
      console.log('inside else part---->');
      nodes = await this.cgcInterventionModel
        .find({
          activated: true,
          parentId: null,
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
    nodes = await Promise.all(
      nodes.map(async (doc) => {
        const translatedFields =
          await this.languageTranslation.getTranslatedFields(doc, lang);
        return {
          ...doc._doc,
          ...translatedFields,
        };
      }),
    );
    return this.baseResponse.sendResponse(200, 'List of Master Nodes', nodes);
  }

  async getChild(rootNodeId: string, lang: string) {
    console.log(`This Action return child of rootNode ${rootNodeId}`);
    if (!lang) {
      lang = 'en';
    }
    // Fetch the root node and its immediate children
    const rootNode = await this.cgcInterventionModel
      .findById(rootNodeId)
      .populate('children')
      .exec();
    if (!rootNode) {
      return [];
    }
    const children = await this.fetchDescendants(rootNode, lang);
    const nodeDetails = {
      _id: rootNode._id,
      title:
        rootNode.title[lang] !== undefined
          ? { [lang]: rootNode.title[lang] }
          : { en: rootNode.title['en'] },
      description:
        rootNode.description[lang] !== undefined
          ? { [lang]: rootNode.description[lang] }
          : { en: rootNode.description['en'] },
      children: children,
    };
    return this.baseResponse.sendResponse(
      200,
      'List of Dependent Nodes!!',
      nodeDetails,
    );
  }

  async getMasterNodes() {
    console.log(`This action return all Master Nodes details to Admin user`);
    const nodes = await this.cgcInterventionModel
      .find({
        // activated: true,
        parentId: null,
      })
      .exec();
    return this.baseResponse.sendResponse(200, 'List of Master Nodes', nodes);
  }

  async getAllDescendants(lang: string) {
    if (!lang) {
      lang = 'en';
    }
    // Fetch the root node and its immediate children
    const masterNodes = await this.cgcInterventionModel
      .find({
        activated: true,
        parentId: null,
      })
      .exec();
    const nodeDetailsArray = await Promise.all(
      masterNodes.map(async (item) => {
        const rootNode = await this.cgcInterventionModel
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
    node: AlgorithmCgcInterventionDocument,
    lang: string = 'en',
  ): Promise<AlgorithmCgcInterventionDocument[]> {
    // Fetch the immediate children of the given node
    const children = await this.cgcInterventionModel
      .find({ parentId: node._id })
      .lean() // Use .lean() to fetch plain JavaScript objects if necessary
      .exec();

    // Cast each child to AlgorithmCgcInterventionDocument type
    const getTranslatedFields = (child) => {
      const translatedTitle =
        child.title[lang] !== undefined
          ? { [lang]: child.title[lang] }
          : { en: child.title['en'] };
      let translatedDescription;
      if (child.description) {
        translatedDescription =
          child.description[lang] !== undefined
            ? { [lang]: child.description[lang] }
            : { en: child.description['en'] };
      }
      return {
        title: translatedTitle,
        description: translatedDescription,
      };
    };

    // Map through children and add translated fields
    const typedChildren = children.map((child) => {
      const { title, description } = getTranslatedFields(child);
      return {
        ...child,
        title, // Add the translated title
        description, // Add the translated description
        children: [], // Initialize children as an empty array
      } as AlgorithmCgcInterventionDocument;
    });

    // Recursively fetch descendants for each child
    for (const child of typedChildren) {
      child.children = await this.fetchDescendants(child);
    }

    return typedChildren;
  }

  async buildQuery(algo: any) {
    const baseQuery = {};
    if (!algo.isAllCadre && algo.cadreIds.length > 0) {
      baseQuery['cadreId'] = {
        $in: algo.cadreIds,
      };
    }
    if (!algo.isAllState && algo.stateIds.length > 0) {
      baseQuery['stateId'] = {
        $in: algo.stateIds,
      };
    }
    return baseQuery;
  }

  async sendInitialInvitation(id: string, adminUserId: string) {
    console.log(`This action send notification to subscriber`);
    const algorithm = await this.cgcInterventionModel.findById(id);
    const baseQuery = await this.buildQuery(algorithm);
    const user = await this.subscriberModel.find(baseQuery);
    const userId = user.map((item) => item._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({ userId: { $in: userId } }) // <-- fixed here
      .select('notificationToken');
    let notification = {};
    if (deviceToken.length > 0) {
      notification = {
        title: 'New Module',
        description: algorithm.title ? algorithm.title['en'] : '',
        automaticNotificationType: 'Diagnosis Algorithm',
        userId: userId,
        link: `${process.env.FRONTEND_URL}/AlgorithmList/TITLE_CGC_INTERVENTION/Diagnosis Algorithm/NTEP`,
        status: 'Pending',
        createdBy: new mongoose.Types.ObjectId(adminUserId),
        isDeepLink: true,
        typeTitle: new mongoose.Types.ObjectId(id),
        type: 'NTEP',
      };

      /* Store Details into Automatic Notification table */
      const notificationData =
        await this.userNotificationModel.create(notification);
      /* Need To use Queue */
      this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'algorithm',
      );

      return this.baseResponse.sendResponse(
        200,
        'Notifications are in Queue!!',
        [],
      );
    }
    await this.cgcInterventionModel.findByIdAndUpdate(
      id,
      {
        sendInitialNotification: true,
      },
      { new: true },
    );
  }

  async scriptCgcInterventionAlgorithm() {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/cgc_algo_script_data.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      if (!record.deleted_at) {
        const cgcInterventionId = await this.cgcInterventionModel
          .findOne({
            id: record.parent_id,
          })
          .select('_id')
          .lean(true);

        const masterId = await this.cgcInterventionModel
          .findOne({
            id: record.master_node_id,
          })
          .select('_id')
          .lean(true);
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
        if (cgcInterventionId) {
          record.parentId = cgcInterventionId._id;
          record.masterNodeId = masterId !== null ? masterId?._id : null;
          record.stateIds = state;
          record.cadreIds = cadre;
        } else {
          record.parentId = null;
          record.masterNodeId = masterId !== null ? masterId?._id : null;
          record.stateIds = state;
          record.cadreIds = cadre;
        }
        record.title = record.title;
        record.description = record.description;
        record.header = record.header;
        record.subHeader = record.sub_header;
        record.nodeType = record.node_type;
        record.isExpandable = record.is_expandable;
        record.hasOptions = record.has_options;
        record.timeSpent = record.time_spent;
        let nodeId;
        if (record.redirect_algo_type === 'Diagnosis Algorithm') {
          nodeId = await this.diagnosisModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        } else if (
          record.redirect_algo_type === 'Differential Care Algorithm'
        ) {
          nodeId = await this.differentialCareModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        } else if (record.redirect_algo_type === 'Guidance on ADR') {
          nodeId = await this.guidanceOnAdrModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        } else if (record.redirect_algo_type === 'Latent TB Infection') {
          nodeId = await this.latentTbModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        } else if (record.redirect_algo_type === 'Treatment Algorithm') {
          nodeId = await this.treatmentModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        } else if (record.redirect_algo_type === 'CGC Algorithm') {
          nodeId = await this.cgcInterventionModel
            .findOne({
              id: record.redirect_node_id,
            })
            .select('title');
        }
        record.redirectAlgoType = record.redirect_algo_type;
        record.redirectNodeId =
          nodeId && nodeId !== ''
            ? new mongoose.Types.ObjectId(nodeId._id)
            : '';
        record.sendInitialNotification = record.send_initial_notification;
        record.createdAt = new Date(record.created_at);
        record.updatedAt = new Date(record.updated_at);
        record.deletedAt = record.deleted_at ? new Date(record.deleted_at) : '';
        // console.log('record --->', record);
        await new this.cgcInterventionModel(record).save();
        // break;
      }
    }
    return true;
  }
}
