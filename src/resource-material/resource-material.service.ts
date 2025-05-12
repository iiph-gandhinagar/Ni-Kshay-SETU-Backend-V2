import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { LanguageTranslation } from 'src/common/utils/languageTranslation.service';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { CountryDocument } from 'src/country/entities/country.entity';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { CreateResourceMaterialDto } from './dto/create-resource-material.dto';
import { UpdateResourceMaterialDto } from './dto/update-resource-material.dto';
import { ResourceMaterialDocument } from './entities/resource-material.entity';

@Injectable()
export class ResourceMaterialService {
  constructor(
    @InjectModel('ResourceMaterial')
    private readonly resourceMaterialModel: Model<ResourceMaterialDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
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
  ): Promise<ResourceMaterialDocument> {
    console.log('inside find by property Resource Material----->');
    return this.resourceMaterialModel.findOne({ [property]: value }).exec();
  }

  async create(
    createResourceMaterialDto: CreateResourceMaterialDto,
    userId: string,
  ) {
    console.log('This action adds a new Resource Material');
    createResourceMaterialDto.countryId = new mongoose.Types.ObjectId(
      createResourceMaterialDto.countryId,
    );
    createResourceMaterialDto.stateId = createResourceMaterialDto.stateId.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    createResourceMaterialDto.cadreId = createResourceMaterialDto.cadreId.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    createResourceMaterialDto.createdBy = new mongoose.Types.ObjectId(userId);
    if (createResourceMaterialDto.parentId) {
      createResourceMaterialDto.parentId = new mongoose.Types.ObjectId(
        createResourceMaterialDto.parentId,
      );
    }
    const newResourceMaterial = await this.resourceMaterialModel.create(
      createResourceMaterialDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_CREATED,
      newResourceMaterial,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all resource material');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' }, // Populate countryId and select only the name field
      { path: 'stateId', select: 'title' }, // Populate stateId and select only the name field
      { path: 'cadreId', select: 'title' }, // Populate cadreId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'resource-material',
    );
    return await paginate(
      this.resourceMaterialModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Resource material`);
    const getResourceMaterialById = await this.resourceMaterialModel
      .findById(id)
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_LIST,
      getResourceMaterialById,
    );
  }

  async update(
    id: string,
    updateResourceMaterialDto: UpdateResourceMaterialDto,
  ) {
    console.log(`This action updates a #${id} Resource Material`);
    if (updateResourceMaterialDto.countryId) {
      updateResourceMaterialDto.countryId = new mongoose.Types.ObjectId(
        updateResourceMaterialDto.countryId,
      );
    }
    if (updateResourceMaterialDto.stateId) {
      updateResourceMaterialDto.stateId = updateResourceMaterialDto.stateId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (updateResourceMaterialDto.cadreId) {
      updateResourceMaterialDto.cadreId = updateResourceMaterialDto.cadreId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (updateResourceMaterialDto.parentId) {
      updateResourceMaterialDto.parentId = new mongoose.Types.ObjectId(
        updateResourceMaterialDto.parentId,
      );
    }
    const updateDetails = await this.resourceMaterialModel
      .findByIdAndUpdate(id, updateResourceMaterialDto, { new: true })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Resource material`);
    await this.resourceMaterialModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_DELETE,
      [],
    );
  }

  async buildResourceMaterialQuery(user: any, parentId: string) {
    const baseQuery = {
      $and: [
        {
          $or: [
            { cadreId: { $in: [new mongoose.Types.ObjectId(user.cadreId)] } },
            { isAllCadre: true },
          ],
        },
        { parentId: new mongoose.Types.ObjectId(parentId) },
        { 'title.en': { $ne: '' } },
      ],
    };
    if (['National_Level'].includes(user.cadreType)) {
      baseQuery['countryId'] = user.countryId;
    }
    if (['International_Level'].includes(user.cadreType)) {
    } else {
      baseQuery['$or'] = [
        { stateId: { $in: [new mongoose.Types.ObjectId(user.stateId)] } }, // Matches the user's specific stateId
        { isAllState: true }, // Allows assessments with 'All' in stateId
      ];
    }
    return baseQuery;
  }

  async getAllMaterials(
    lang: string,
    userId: string,
    filter: string,
    parentId: string,
  ) {
    console.log(`This action returns all type of material details`);
    if (lang == null) {
      lang = 'en';
    }
    let sorting;
    if (filter === 'name') {
      sorting = { name: -1 };
    } else if (filter === 'date') {
      sorting = { createdAt: -1 };
    }
    const user = await this.subscriberModel
      .findById(userId)
      .select('cadreId stateId phoneNo countryId name cadreType');
    const result = await this.buildResourceMaterialQuery(user, parentId);
    let resourceMaterial;
    resourceMaterial = await this.resourceMaterialModel
      .find(result)

      .select(
        'title typeOfMaterials parentId iconType index createdBy relatedMaterials id',
      )
      .sort(sorting)
      .lean(true);
    resourceMaterial = await Promise.all(
      resourceMaterial.map(async (doc) => {
        const translatedFields =
          await this.languageTranslation.getSymptomTranslatedFields(doc, lang);
        return {
          ...doc,
          ...translatedFields,
        };
      }),
    );
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_LIST,
      resourceMaterial,
    );
  }

  async getAllMaterial(lang: string, filter: string, parentId: string) {
    console.log(`This action returns all type of material details`);

    let sorting;
    if (filter === 'name') {
      sorting = { name: -1 };
    } else if (filter === 'date') {
      sorting = { createdAt: -1 };
    }

    const resourceMaterial = await this.resourceMaterialModel
      .find({ parentId: parentId })
      .populate([
        { path: 'countryId', select: 'title' },
        { path: 'stateId', select: 'title' },
        { path: 'cadreId', select: 'title' },
      ])
      .sort(sorting)
      .lean(true);
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_LIST,
      resourceMaterial,
    );
  }

  async getAllDescendants(rootNodeId: string, lang: string) {
    console.log(
      `This Action return all rootNode with its child language --> ${lang}`,
    );
    if (!lang) {
      lang = 'en';
    }
    const rootNode = await this.resourceMaterialModel
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
      children: children,
    };
    return this.baseResponse.sendResponse(
      200,
      'List of Dependent Nodes!!',
      nodeDetails,
    );
  }

  async fetchDescendants(
    node: ResourceMaterialDocument,
    lang: string = 'en',
  ): Promise<ResourceMaterialDocument[]> {
    // Fetch the immediate children of the given node
    const children = await this.resourceMaterialModel
      .find({
        parentId: node._id,
        'title.en': { $ne: '' },
      })
      .select(
        'title typeOfMaterials parentId iconType index createdBy relatedMaterials id',
      )
      .lean() // Use .lean() to fetch plain JavaScript objects if necessary
      .exec();

    // Cast each child to ResourceMaterialDocument type
    const typedChildren = children.map(
      (child) =>
        ({
          ...child,
          children: [], // Initialize children as an empty array
        }) as ResourceMaterialDocument,
    );

    // Recursively fetch descendants for each child
    for (const child of typedChildren) {
      child.children = await this.fetchDescendants(child, lang);
    }

    return typedChildren;
  }

  async rootFolders(lang) {
    console.log(`This Action return root folders details(Subscriber)`);
    if (!lang) {
      lang = 'en';
    }
    let rootFolders;
    rootFolders = await this.resourceMaterialModel
      .find({
        parentId: null,
        typeOfMaterials: 'folder',
        [`title.${lang}`]: { $ne: '' },
      })
      .select('title typeOfMaterials index iconType relatedMaterials')
      .sort({ index: 1 });
    rootFolders = await Promise.all(
      rootFolders.map(async (doc) => {
        const documentData = doc.toObject();
        const translatedFields =
          await this.languageTranslation.getSymptomTranslatedFields(
            documentData,
            lang,
          );
        return {
          ...documentData,
          ...translatedFields,
        };
      }),
    );
    return this.baseResponse.sendResponse(
      200,
      message.resourceMaterial.RESOURCE_MATERIAL_LIST,
      rootFolders,
    );
  }

  async buildQuery(material: any) {
    const baseQuery = {};
    if (!material.isAllCadre && material.cadreId.length > 0) {
      baseQuery['cadreId'] = {
        $in: material.cadreId,
      };
    }

    if (material.countryId) {
      baseQuery['countryId'] = new mongoose.Types.ObjectId(material.countryId);
    } else if (!material.isAllDistrict && material.districtId.length > 0) {
      baseQuery['districtId'] = {
        $in: material.districtId,
      };
    } else if (!material.isAllState && material.stateId.length > 0) {
      console.log(`State of subscriber --->`, material.stateId);
      baseQuery['stateId'] = {
        $in: material.stateId,
      };
    }
    return baseQuery;
  }

  async sendInitialInvitation(id: string, adminUserId: string) {
    console.log(`This action send notification to subscriber`);
    const resource = await this.resourceMaterialModel.findById(id);
    const baseQuery = await this.buildQuery(resource);
    const user = await this.subscriberModel.find(baseQuery);
    const userId = user.map((item) => item._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: userId },
      })
      .select('notificationToken');
    const resourceMaterialParentId = await this.resourceMaterialModel
      .findOne({ parentId: resource.parentId })
      .select('title typeOfMaterial');

    if (deviceToken.length > 0) {
      const notification: any = {};
      notification.title = 'New Resource Material Added';
      notification.description = resource.title ? resource.title['en'] : '';
      notification.automaticNotificationType = 'Resource Material';
      notification.userId = userId;
      notification.link = `${process.env.FRONTEND_URL}/resourceMaterial/${resourceMaterialParentId.title['en']}/${resource.parentId}`;
      notification.status = 'Pending';
      notification.createdBy = new mongoose.Types.ObjectId(adminUserId);
      notification.isDeepLink = true;
      notification.typeTitle = new mongoose.Types.ObjectId(id);
      notification.type = 'Automatic Notification';
      /* Store Details into Automatic Notification table */
      const notificationData =
        await this.userNotificationModel.create(notification);
      /* Need To use Queue */

      this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'resourceMaterial',
      );

      return this.baseResponse.sendResponse(
        200,
        'Notifications are in Queue!!',
        [],
      );
    }
    await this.resourceMaterialModel.findByIdAndUpdate(
      id,
      {
        sendInitialNotification: true,
      },
      { new: true },
    );
  }

  async scriptForResourceMaterial(userId: string) {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/resource_material_script_data.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      if (record.deleted_at == '') {
        const resourceMaterialId = await this.resourceMaterialModel
          .findOne({
            id: record.parent_id,
          })
          .select('_id');
        const stateIds =
          record.state &&
          record.state !== '[]' &&
          record.state !== '' &&
          record.state.Length !== 0
            ? record.state.split(',')
            : [];
        const cadreIds =
          record.cadre &&
          record.cadre !== '[]' &&
          record.cadre !== '' &&
          record.cadre.Length !== 0
            ? record.cadre.split(',')
            : [];
        const state = await this.stateModel
          .find({ id: { $in: stateIds } })
          .select('_id title')
          .then((states) => states.map((state) => state._id));
        const cadre = await this.cadreModel
          .find({ id: { $in: cadreIds } })
          .select('_id title')
          .then((cadres) => cadres.map((cadre) => cadre._id));
        if (resourceMaterialId) {
          record.parentId = resourceMaterialId._id;
          record.stateId = state;
          record.cadreId = cadre;
        } else {
          record.parentId = null;
          record.stateId = state;
          record.cadreId = cadre;
        }
        if (record.country_id) {
          const country = await this.countryModel
            .findOne({ id: record.country_id })
            .select('_id');
          console.log('record.title -->', record.title);
          record.countryId = country._id;
        }

        record.title =
          record.title && record.title !== null ? record.title : { en: '' };
        record.typeOfMaterials = record.type_of_materials;
        record.iconType = record.icon_type;
        record.createdBy = new mongoose.Types.ObjectId(userId);
        record.id = record.id;
        record.createdAt = new Date(record.created_at);
        record.updatedAt = new Date(record.updated_at);
        record.deletedAt = record.deleted_at ? new Date(record.deleted_at) : '';
        await new this.resourceMaterialModel(record).save();
        // break;
      }
    }
    return true;
  }

  async scriptForMaterial() {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Documents/nikshay setu/ns-rewamp-backend.resourcematerials.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      console.log('record -->', record.id, record.relatedMaterials);
      await this.resourceMaterialModel.updateMany(
        { id: record.id },
        { relatedMaterials: record.relatedMaterials },
      );
      // break;
    }
    return true;
  }
}
