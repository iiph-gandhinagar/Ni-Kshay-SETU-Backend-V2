import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { AlgorithmCgcInterventionDocument } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareDocument } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionDocument } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
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
import { CreateAlgorithmLatentTbInfectionDto } from './dto/create-algorithm-latent-tb-infection.dto';
import { UpdateAlgorithmLatentTbInfectionDto } from './dto/update-algorithm-latent-tb-infection.dto';
import { AlgorithmLatentTbInfectionDocument } from './entities/algorithm-latent-tb-infection.entity';
dotenv.config();

@Injectable()
export class AlgorithmLatentTbInfectionService {
  constructor(
    @InjectModel('AlgorithmLatentTbInfection')
    private readonly latentTbModel: Model<AlgorithmLatentTbInfectionDocument>,
    @InjectModel('AlgorithmDiagnosis')
    private readonly diagnosisModel: Model<AlgorithmDiagnosisDocument>,
    @InjectModel('AlgorithmDifferentialCare')
    private readonly differentialCareModel: Model<AlgorithmDifferentialCareDocument>,
    @InjectModel('AlgorithmGuidanceOnAdverseDrugReaction')
    private readonly guidanceOnAdrModel: Model<AlgorithmGuidanceOnAdverseDrugReactionDocument>,
    @InjectModel('AlgorithmTreatment')
    private readonly treatmentModel: Model<AlgorithmTreatmentDocument>,
    @InjectModel('AlgorithmCgcIntervention')
    private readonly cgcInterventionModel: Model<AlgorithmCgcInterventionDocument>,
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
    @Inject(forwardRef(() => LanguageTranslation))
    private readonly languageTranslation: LanguageTranslation,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}
  async findByProperty(
    property: string,
    value: string,
  ): Promise<AlgorithmLatentTbInfectionDocument> {
    console.log('inside find by property Algorithm Latent Tb----->');
    return this.latentTbModel.findOne({ [property]: value }).exec();
  }

  async create(
    createAlgorithmLatentTbInfectionDto: CreateAlgorithmLatentTbInfectionDto,
  ) {
    console.log('This action adds a new Algorithm Latent Tb');
    if (createAlgorithmLatentTbInfectionDto.stateIds) {
      createAlgorithmLatentTbInfectionDto.stateIds =
        createAlgorithmLatentTbInfectionDto.stateIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }

    if (createAlgorithmLatentTbInfectionDto.cadreIds) {
      createAlgorithmLatentTbInfectionDto.cadreIds =
        createAlgorithmLatentTbInfectionDto.cadreIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }

    if (createAlgorithmLatentTbInfectionDto.parentId) {
      createAlgorithmLatentTbInfectionDto.parentId =
        new mongoose.Types.ObjectId(
          createAlgorithmLatentTbInfectionDto.parentId,
        );
    }
    if (createAlgorithmLatentTbInfectionDto.redirectNodeId) {
      createAlgorithmLatentTbInfectionDto.redirectNodeId =
        new mongoose.Types.ObjectId(
          createAlgorithmLatentTbInfectionDto.redirectNodeId,
        );
    }
    if (createAlgorithmLatentTbInfectionDto.masterNodeId) {
      createAlgorithmLatentTbInfectionDto.masterNodeId =
        new mongoose.Types.ObjectId(
          createAlgorithmLatentTbInfectionDto.masterNodeId,
        );
    }
    const newLatentTb = await this.latentTbModel.create(
      createAlgorithmLatentTbInfectionDto,
    );
    // const latentTb = await newLatentTb.save();
    return this.baseResponse.sendResponse(
      200,
      message.latentTbAlgorithm.LATENT_TB_ALGORITHM_CREATED,
      newLatentTb,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Algorithm Latent Tb');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'stateIds', select: 'title' }, // Populate stateId and select only the name field
      { path: 'cadreIds', select: 'title' }, // Populate districtId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.latentTbModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Algorithm Latent Tb`);
    const getLatentTbById = await this.latentTbModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.latentTbAlgorithm.LATENT_TB_ALGORITHM_LIST,
      getLatentTbById,
    );
  }

  async update(
    id: string,
    updateAlgorithmLatentTbInfectionDto: UpdateAlgorithmLatentTbInfectionDto,
  ) {
    console.log(`This action updates a #${id} Algorithm Latent Tb`);
    const updateDetails = await this.latentTbModel.findByIdAndUpdate(
      id,
      updateAlgorithmLatentTbInfectionDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.latentTbAlgorithm.LATENT_TB_ALGORITHM_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Algorithm Latent Tb`);
    await this.latentTbModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.latentTbAlgorithm.LATENT_TB_ALGORITHM_DELETE,
      [],
    );
  }

  async getChild(rootNodeId: string, lang: string) {
    console.log(`This Action return child of rootNode ${rootNodeId}`);
    if (!lang) {
      lang = 'en';
    }
    // Fetch the root node and its immediate children
    const rootNode = await this.latentTbModel
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

  async getMasterNode(userId: string, lang: string) {
    if (!lang) {
      lang = 'en';
    }
    console.log('get master node service -->');
    const user = await this.subscriberModel
      .findById(userId)
      .select('stateId cadreId');
    let nodes;
    if (user.stateId) {
      nodes = await this.latentTbModel
        .find({
          activated: true,
          parentId: null,
          $or: [{ cadreIds: { $in: [user.cadreId] } }, { isAllCadre: true }],
        })
        .exec();
    } else {
      nodes = await this.latentTbModel
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

  async getMasterNodes() {
    console.log(`This action return all Master Nodes details to Admin user`);
    const nodes = await this.latentTbModel
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
    const masterNodes = await this.latentTbModel
      .find({
        activated: true,
        parentId: null,
      })
      .exec();
    const nodeDetailsArray = await Promise.all(
      masterNodes.map(async (item) => {
        const rootNode = await this.latentTbModel
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
    node: AlgorithmLatentTbInfectionDocument,
    lang: string = 'en',
  ): Promise<AlgorithmLatentTbInfectionDocument[]> {
    // Fetch the immediate children of the given node
    const children = await this.latentTbModel
      .find({ parentId: node._id })
      .lean() // Use .lean() to fetch plain JavaScript objects if necessary
      .exec();

    const getTranslatedFields = (child) => {
      const translatedTitle =
        child.title[lang] !== undefined && child.title[lang] !== null
          ? { [lang]: child.title[lang] }
          : { en: child.title['en'] };
      let translatedDescription;
      if (child.description) {
        translatedDescription =
          child.description[lang] !== undefined &&
          child.description[lang] !== null
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
      } as AlgorithmLatentTbInfectionDocument;
    });

    for (const child of typedChildren) {
      child.children = await this.fetchDescendants(child, lang);
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
    const algorithm = await this.latentTbModel.findById(id);
    const baseQuery = await this.buildQuery(algorithm);
    const user = await this.subscriberModel.find(baseQuery);
    const userId = user.map((item) => item._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: userId },
      })
      .select('notificationToken');
    let notification, link;
    if (algorithm.parentId != null) {
      link = `${process.env.FRONTEND_URL}/algorithmView/TB%20Preventive%20Treatment/${algorithm.parentId}`;
    } else {
      link = `${process.env.FRONTEND_URL}/algorithmScreen/TB%20Preventive%20Treatment`;
    }
    if (deviceToken.length > 0) {
      notification = {
        title: 'New Module',
        description: algorithm.title ? algorithm.title['en'] : '',
        automaticNotificationType: 'Latent TB Infection',
        userId: userId,
        link: link,
        status: 'Pending',
        createdBy: new mongoose.Types.ObjectId(adminUserId),
        isDeepLink: true,
        typeTitle: new mongoose.Types.ObjectId(id),
        type: 'Automatic Notification',
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
    await this.latentTbModel.findByIdAndUpdate(
      id,
      {
        sendInitialNotification: true,
      },
      { new: true },
    );
  }

  async scriptLatentTbAlgorithm() {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/latent_tb_algo_script_data.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      if (!record.deleted_at) {
        const latentTbId = await this.latentTbModel
          .findOne({
            id: record.parent_id,
          })
          .select('_id');

        const masterId = await this.latentTbModel
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
        if (latentTbId) {
          record.parentId = latentTbId._id;
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
        await new this.latentTbModel(record).save();
      }
    }
    return true;
  }
}
