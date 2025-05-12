// src/region/region.service.ts
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmCgcInterventionDocument } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareDocument } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionDocument } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionDocument } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentDocument } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { BlockDocument } from 'src/block/entities/block.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { CountryDocument } from 'src/country/entities/country.entity';
import { DistrictDocument } from 'src/district/entities/district.entity';
import { FlashNewsDocument } from 'src/flash-news/entities/flash-new.entity';
import { FlashSimilarAppDocument } from 'src/flash-similar-apps/entities/flash-similar-app.entity';
import { HealthFacilityDocument } from 'src/health-facility/entities/health-facility.entity';
import { PluginManagementDocument } from 'src/plugin-management/entities/plugin-management.entity';
import { PrimaryCadreDocument } from 'src/primary-cadre/entities/primary-cadre.entity';
import { ResourceMaterialDocument } from 'src/resource-material/entities/resource-material.entity';
import { RoleDocument } from 'src/roles/entities/role.entity';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel('State') private stateModel: Model<StateDocument>,
    @InjectModel('Role') private roleModel: Model<RoleDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @InjectModel('Assessment')
    private assessmentModel: Model<AssessmentDocument>,
    @InjectModel('PluginManagement')
    private pluginManagementModel: Model<PluginManagementDocument>,
    @InjectModel('Subscriber')
    private subscriberModel: Model<SubscriberDocument>,
    @InjectModel('District') private districtModel: Model<DistrictDocument>,
    @InjectModel('Block') private blockModel: Model<BlockDocument>,
    @InjectModel('Cadre') private cadreModel: Model<CadreDocument>,
    @InjectModel('Country') private countryModel: Model<CountryDocument>,
    @InjectModel('PrimaryCadre')
    private primaryCadreModel: Model<PrimaryCadreDocument>,
    @InjectModel('AlgorithmDiagnosis')
    private algorithmDiagnosisModel: Model<AlgorithmDiagnosisDocument>,
    @InjectModel('AlgorithmCgcIntervention')
    private algorithmCgcModel: Model<AlgorithmCgcInterventionDocument>,
    @InjectModel('AlgorithmDifferentialCare')
    private algorithmDifferentialModel: Model<AlgorithmDifferentialCareDocument>,
    @InjectModel('AlgorithmGuidanceOnAdverseDrugReaction')
    private algorithmGuidanceOnADRModel: Model<AlgorithmGuidanceOnAdverseDrugReactionDocument>,
    @InjectModel('AlgorithmLatentTbInfection')
    private algorithmLatentTbModel: Model<AlgorithmLatentTbInfectionDocument>,
    @InjectModel('AlgorithmTreatment')
    private algorithmTreatmentModel: Model<AlgorithmTreatmentDocument>,
    @InjectModel('FlashNews') private flashNewsModel: Model<FlashNewsDocument>,
    @InjectModel('ResourceMaterial')
    private resourceMaterialModel: Model<ResourceMaterialDocument>,
    @InjectModel('FlashSimilarApp')
    private flashSimilarAppModel: Model<FlashSimilarAppDocument>,
    @InjectModel('HealthFacility')
    private healthFacilityModel: Model<HealthFacilityDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async getAllStates() {
    const states = await this.stateModel
      .find()
      .sort([['title', 1]])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_STATE,
      states,
    );
  }

  async getAllAdminState(userId: string) {
    const adminUser = await this.adminUserModel.findById(userId);
    if (!adminUser) {
      throw new HttpException(
        {
          message: 'Admin User Not Found',
          error: 'Admin User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    let states;
    if (adminUser.isAllState == false && adminUser.state.length > 0) {
      states = await this.stateModel
        .find({ _id: { $in: adminUser.state } })
        .sort([['title', 1]]);
    } else {
      states = await this.stateModel.find().sort([['title', 1]]);
    }

    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_STATE,
      states,
    );
  }

  async getAllAdminDistrict(userId: string) {
    const adminUser = await this.adminUserModel.findById(userId);
    if (!adminUser) {
      throw new HttpException(
        {
          message: 'Admin User Not Found',
          error: 'Admin User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    let states;
    if (adminUser.isAllDistrict == false && adminUser.district.length > 0) {
      states = await this.districtModel
        .find({ _id: { $in: adminUser.district } })
        .sort([['title', 1]]);
    } else if (adminUser.isAllState == false && adminUser.state.length > 0) {
      states = await this.districtModel
        .find({ stateId: { $in: adminUser.state } })
        .sort([['title', 1]]);
    } else {
      states = await this.districtModel.find().sort([['title', 1]]);
    }

    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_DISTRICT,
      states,
    );
  }

  async getAllDistricts(paginationDto: PaginationDto) {
    const { stateId, search, allState } = paginationDto;

    let query: any = {};
    if (search !== '' && search !== undefined) {
      query = { stateId: new RegExp(search, 'i') }; // 'i' for case-insensitive
    } else if (allState == 'true') {
      query = {};
    } else if (stateId && stateId.length > 0 && Array.isArray(stateId)) {
      query.$or = stateId.map((t) => ({
        stateId: new mongoose.Types.ObjectId(t), // 'i' for case-insensitive
      })); // Filter by any name in the array
    } else if (typeof stateId === 'string') {
      if (!(stateId == 'All' || stateId == 'all' || stateId == 'ALL')) {
        query.stateId = new mongoose.Types.ObjectId(stateId);
      }
    }
    const districts = await this.districtModel
      .find(query)
      .select('title')
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_DISTRICT,
      districts,
    );
  }

  async getAllBlocks(paginationDto: PaginationDto) {
    const { districtId, search, allDistrict } = paginationDto;

    let query: any = {};
    if (search !== '' && search !== undefined) {
      query = { districtId: new RegExp(search, 'i') }; // 'i' for case-insensitive
    } else if (allDistrict) {
      query = {};
    } else if (
      districtId &&
      districtId.length > 0 &&
      Array.isArray(districtId)
    ) {
      query.$or = districtId.map((t) => ({
        districtId: new mongoose.Types.ObjectId(t), // 'i' for case-insensitive
      })); // Filter by any name in the array
    } else if (typeof districtId === 'string') {
      if (
        !(districtId == 'All' || districtId == 'all' || districtId == 'ALL')
      ) {
        query.districtId = new mongoose.Types.ObjectId(districtId);
      }
    }
    const blocks = await this.blockModel.find(query).select('title').exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_BLOCK,
      blocks,
    );
  }

  async getAllCadres(paginationDto: PaginationDto) {
    const { cadreTypes } = paginationDto;

    let query: any = {};

    if (cadreTypes && cadreTypes.length > 0 && Array.isArray(cadreTypes)) {
      if (
        cadreTypes.includes('ALL') ||
        cadreTypes.includes('all') ||
        cadreTypes.includes('All')
      ) {
        query = {};
      } else {
        query.$or = cadreTypes.map((t) => ({
          cadreType: { $regex: t, $options: 'i' }, // 'i' for case-insensitive
        }));
      }
      // Filter by any name in the array
    } else if (typeof cadreTypes === 'string') {
      if (
        !(cadreTypes == 'All' || cadreTypes == 'all' || cadreTypes == 'ALL')
      ) {
        // query.cadreType = { $regex: cadreTypes, $options: 'i' };
        query.cadreType = { $regex: `^${cadreTypes}$`, $options: 'i' };
      }
    }
    const cadres = await this.cadreModel
      .find(query)
      .sort([
        ['title', 1],
        [
          'FIELD(title , "Consultant - Development Partner","Technical Officer (TB)","Specialist (TB)","National Consultant (TB)","Joint Director (TB)","Additional Deputy Director General (ADDG) -TB","Deputy Director General (DDG) - TB")',
          -1,
        ],
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_CADRE,
      cadres,
    );
  }

  async getAllCadreList() {
    const cadres = await this.cadreModel
      .find({})
      .sort([
        ['title', 1],
        [
          'FIELD(title , "Consultant - Development Partner","Technical Officer (TB)","Specialist (TB)","National Consultant (TB)","Joint Director (TB)","Additional Deputy Director General (ADDG) -TB","Deputy Director General (DDG) - TB")',
          -1,
        ],
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_CADRE,
      cadres,
    );
  }

  async getAllCadreTypes() {
    const cadreTypes = await this.cadreModel
      .distinct('cadreType')
      .sort([
        ['cadre_type', 1],
        ['FIELD(cadre_type , "National_Level")', -1],
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_CADRE_TYPE,
      cadreTypes,
    );
  }

  async getAllHealthFacilities(paginationDto: PaginationDto) {
    const { blockId, search, allBlock } = paginationDto;
    console.log('blockId -->', blockId);
    let query: any = {};
    if (search !== '' && search !== undefined) {
      query = { blockId: new RegExp(search, 'i') }; // 'i' for case-insensitive
    } else if (allBlock) {
      query = {};
    }
    if (blockId && blockId.length > 0 && Array.isArray(blockId)) {
      query.$or = blockId.map((t) => ({
        blockId: new mongoose.Types.ObjectId(t), // 'i' for case-insensitive
      })); // Filter by any name in the array
    } else if (typeof blockId === 'string') {
      if (!(blockId == 'All' || blockId == 'all' || blockId == 'ALL')) {
        query.blockId = new mongoose.Types.ObjectId(blockId);
      }
    }
    const healthFacilities = await this.healthFacilityModel
      .find(query)
      .select('healthFacilityCode')
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_HEALTH_FACILITY,
      healthFacilities,
    );
  }

  async referralHealthFacilities(request: any) {
    console.log('request --->', request);
    const { stateId, districtId, blockId } = request;
    console.log('stateId districtId---', stateId, districtId);
    console.log(`This action return referral health facility based on query`);
    let orderId = 'asc';
    if (request.sortOrder && request.sortOrder.toUpperCase() === 'DESC') {
      orderId = 'DESC';
    }
    console.log('order status --->', orderId);
    // Initialize the query with conditions

    // Prepare query conditions
    const queryConditions: { [key: string]: any } = {};
    // Apply filters based on request parameters
    if (request.healthFacility) {
      const facilitiesColumnsArray = request.healthFacility.split(',');
      // Add $or condition for healthFacility
      queryConditions.$or = facilitiesColumnsArray.map((facilityCol) => ({
        [facilityCol]: true,
      }));
    }

    if (request.healthFacilityCode) {
      queryConditions.healthFacilityCode = new RegExp(
        request.healthFacilityCode,
        'i',
      );
    }

    if (stateId) {
      queryConditions.stateId = new mongoose.Types.ObjectId(stateId);
    }

    if (districtId) {
      queryConditions.districtId = new mongoose.Types.ObjectId(districtId);
    }

    if (blockId) {
      queryConditions.blockId = new mongoose.Types.ObjectId(blockId);
    }

    // Paginate the results if needed, adjust based on your pagination requirements
    // Example: using Mongoose's `paginate` plugin if integrated
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'districtId', select: 'title' },
      { path: 'stateId', select: 'title' },
      { path: 'blockId', select: 'title' },
    ];
    request.limit = request.limit ? request.limit : 10;
    request.sortBy = 'healthFacilityCode';
    request.sortOrder = orderId;
    return await paginate(
      this.healthFacilityModel,
      request,
      statePopulateOptions,
      queryConditions,
    );
  }

  async homePage(userId: string) {
    console.log(`This action return all home page activities(Mobile)`);
    const flashSimilarApp = await this.flashSimilarAppModel
      .find({
        active: true,
      })
      .sort({ orderIndex: 1 })
      .exec();
    const flashNews = await this.flashNewsModel.find({ active: true });
    const cadre = await this.subscriberModel
      .findById(userId)
      .select('cadreId')
      .exec();
    const plugins = await this.pluginManagementModel
      .find({
        $and: [
          {
            $or: [
              {
                cadreId: { $in: [new mongoose.Types.ObjectId(cadre.cadreId)] },
              },
              { isAllCadre: true },
            ],
          },
        ],
      })
      .select('title')
      .exec();
    const result = {
      flashSimilarApps: flashSimilarApp,
      flashNews: flashNews,
      plugins: plugins,
    };
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.HOME_PAGE_ACTIVITIES,
      result,
    );
  }

  async getAllCountries() {
    const states = await this.countryModel
      .find()
      .sort([['title', 1]])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_COUNTRY,
      states,
    );
  }

  async getMasterNodes(type: string) {
    console.log('Algorithm type -->', type);
    let masterNodes;
    switch (type) {
      case 'Differential Care Algorithm':
        masterNodes = await this.algorithmDifferentialModel
          .find({
            parentId: null,
          })
          .exec();
        break;
      case 'Diagnosis Algorithm':
        masterNodes = await this.algorithmDiagnosisModel
          .find({ parentId: null })
          .select('title')
          .exec();
        break;
      case 'Guidance on ADR':
        masterNodes = await this.algorithmGuidanceOnADRModel
          .find({
            parentId: null,
          })
          .select('title')
          .exec();
        break;
      case 'Latent TB Infection':
        masterNodes = await this.algorithmLatentTbModel
          .find({ parentId: null })
          .select('title')
          .exec();
        break;
      case 'Treatment Algorithm':
        masterNodes = await this.algorithmTreatmentModel
          .find({ parentId: null })
          .select('title')
          .exec();
        break;
      case 'CGC Algorithm':
        masterNodes = await this.algorithmCgcModel
          .find({ parentId: null })
          .select('title')
          .exec();
        break;
      default:
        throw new BadRequestException('Invalid type provided');
    }

    return this.baseResponse.sendResponse(
      200,
      message.masterApi.MASTER_REDIRECT_NODE,
      masterNodes,
    );
  }

  async masterDropDown(userId: string) {
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select('name role state isAllState');
    const role = await this.roleModel.findById(adminUser.role).select('name');
    let resourceMaterial,
      diagnosisAlgo,
      treatmentAlgo,
      latentTbAlgo,
      guidanceAlgo,
      differentialAlgo,
      cgcAlgo,
      assessments;
    if (role.name === 'Admin' || role.name === 'App Admin') {
      resourceMaterial = await this.resourceMaterialModel.find();
      diagnosisAlgo = await this.algorithmDiagnosisModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      treatmentAlgo = await this.algorithmTreatmentModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      latentTbAlgo = await this.algorithmLatentTbModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      guidanceAlgo = await this.algorithmGuidanceOnADRModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      differentialAlgo = await this.algorithmDifferentialModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      cgcAlgo = await this.algorithmCgcModel
        .find({ activated: true })
        .select('title.en')
        .exec();
      assessments = await this.assessmentModel
        .find({ active: true })
        .select('title.en')
        .exec();
    } else {
      resourceMaterial = await this.resourceMaterialModel.find({
        $or: [
          { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
          { isAllState: true }, // Allows assessments with 'All' in stateId
        ],
      });
      diagnosisAlgo = await this.algorithmDiagnosisModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      treatmentAlgo = await this.algorithmTreatmentModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      latentTbAlgo = await this.algorithmLatentTbModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      guidanceAlgo = await this.algorithmGuidanceOnADRModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      differentialAlgo = await this.algorithmDifferentialModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      cgcAlgo = await this.algorithmCgcModel
        .find({
          activated: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
      assessments = await this.assessmentModel
        .find({
          active: true,
          $or: [
            { stateId: { $in: [adminUser.state] } }, // Matches the user's specific stateId
            { isAllState: true }, // Allows assessments with 'All' in stateId
          ],
        })
        .select('title.en')
        .exec();
    }

    const result = {
      assessments: assessments,
      cgcAlgo: cgcAlgo,
      differentialAlgo: differentialAlgo,
      guidanceAlgo: guidanceAlgo,
      latentTbAlgo: latentTbAlgo,
      treatmentAlgo: treatmentAlgo,
      diagnosisAlgo: diagnosisAlgo,
      resourceMaterial: resourceMaterial,
    };
    return this.baseResponse.sendResponse(200, 'Master Data', result);
  }

  async defaultOptionSelection() {
    const cadreType = await this.cadreModel
      .findOne({
        cadreType: new RegExp('International_Level', 'i'),
      })
      .select('cadreType  _id')
      .exec();
    const cadreId = await this.cadreModel
      .findOne({
        title: new RegExp('TB Specialist', 'i'),
      })
      .select('title _id')
      .exec();
    const cadreGroup = await this.primaryCadreModel
      .findOne({
        title: new RegExp('Program Managers- Others', 'i'),
      })
      .select('title _id')
      .exec();
    const stateId = await this.stateModel
      .find({
        title: new RegExp('INTERNATIONAL', 'i'),
      })
      .select('title _id')
      .exec();
    const districtId = await this.districtModel
      .find({
        title: new RegExp('INTERNATIONAL', 'i'),
      })
      .select('title _id')
      .exec();
    const result = {
      cadreType: cadreType,
      cadreId: cadreId,
      cadreGroup: cadreGroup,
      stateId: stateId,
      districtId: districtId,
    };
    return this.baseResponse.sendResponse(
      200,
      'Default Cadre Details!!',
      result,
    );
  }
}
