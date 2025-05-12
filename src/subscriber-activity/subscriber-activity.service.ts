import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';
import mongoose, { Model } from 'mongoose';
import * as path from 'path';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { AlgorithmCgcInterventionDocument } from 'src/algorithm-cgc-intervention/entities/algorithm-cgc-intervention.entity';
import { AlgorithmDiagnosisDocument } from 'src/algorithm-diagnosis/entities/algorithm-diagnosis.entity';
import { AlgorithmDifferentialCareDocument } from 'src/algorithm-differential-care/entities/algorithm-differential-care.entity';
import { AlgorithmGuidanceOnAdverseDrugReactionDocument } from 'src/algorithm-guidance-on-adverse-drug-reaction/entities/algorithm-guidance-on-adverse-drug-reaction.entity';
import { AlgorithmLatentTbInfectionDocument } from 'src/algorithm-latent-tb-infection/entities/algorithm-latent-tb-infection.entity';
import { AlgorithmTreatmentDocument } from 'src/algorithm-treatment/entities/algorithm-treatment.entity';
import { BlockDocument } from 'src/block/entities/block.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { aggregate } from 'src/common/pagination/aggregation.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CountryDocument } from 'src/country/entities/country.entity';
import { DistrictDocument } from 'src/district/entities/district.entity';
import { HealthFacilityDocument } from 'src/health-facility/entities/health-facility.entity';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserAppVersionDocument } from 'src/user-app-version/entities/user-app-version.entity';
import { CreateSubscriberActivityDto } from './dto/create-subscriber-activity.dto';
import { SubscriberActivityDocument } from './entities/subscriber-activity.entity';

@Injectable()
export class SubscriberActivityService {
  constructor(
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('UserAppVersion')
    private readonly userAppVersionModel: Model<UserAppVersionDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('District')
    private readonly districtModel: Model<DistrictDocument>,
    @InjectModel('Block')
    private readonly blockModel: Model<BlockDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('HealthFacility')
    private readonly healthFacilityModel: Model<HealthFacilityDocument>,
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
    @InjectModel('AlgorithmCgcIntervention')
    private readonly cgcInterventionModel: Model<AlgorithmCgcInterventionDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => LeaderBoardService))
    private readonly LeaderBoardServices: LeaderBoardService,
  ) {}
  async create(createSubscriberActivityDto: CreateSubscriberActivityDto) {
    console.log('This action adds a new subscriberActivity');
    let newSubscriberActivity;
    if (
      createSubscriberActivityDto.payload &&
      createSubscriberActivityDto.module == 'App Usage'
    ) {
      const { moduleUsage } = createSubscriberActivityDto.payload;
      for (const item of moduleUsage) {
        console.log('item -->', item);
        let totalTime;
        if (item.module == 'Diagnosis Algorithm') {
          totalTime = await this.diagnosisModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        } else if (item.module == 'Treatment Algorithm') {
          totalTime = await this.treatmentModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        } else if (item.module == 'NTEP Intervention') {
          totalTime = await this.cgcInterventionModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        } else if (item.module == 'Guidance on ADR') {
          totalTime = await this.guidanceOnAdrModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        } else if (item.module == 'Differentiated Care Of TB Patients') {
          totalTime = await this.differentialCareModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        } else if (item.module == 'TB Preventive Treatment') {
          totalTime = await this.latentTbModel
            .findById(item.sub_module_id)
            .select('timeSpent');
        }

        const result = {
          module: item.module,
          timeSpent: item.time,
          subModule: new mongoose.Types.ObjectId(item.sub_module_id),
          action: item.activity_type,
          totalTime: totalTime ? totalTime?.timeSpent : '',
          userId: new mongoose.Types.ObjectId(
            createSubscriberActivityDto.userId,
          ),
          platform: createSubscriberActivityDto.platform,
          ipAddress: createSubscriberActivityDto.ipAddress,
        };
        newSubscriberActivity =
          await this.subscriberActivityModel.create(result);
      }
    } else {
      createSubscriberActivityDto.userId = new mongoose.Types.ObjectId(
        createSubscriberActivityDto.userId,
      );
      if (createSubscriberActivityDto.subModule) {
        createSubscriberActivityDto.subModule = new mongoose.Types.ObjectId(
          createSubscriberActivityDto.subModule,
        );
      }

      newSubscriberActivity = await this.subscriberActivityModel.create(
        createSubscriberActivityDto,
      );

      if (createSubscriberActivityDto.module == 'appVersion') {
        console.log(
          'inside app version condition-->',
          createSubscriberActivityDto.action.split('=='),
        );
        const versionDetails = createSubscriberActivityDto.action.split('==');
        const version =
          versionDetails.length > 1 ? versionDetails[1].trim() : null;

        if (!version) {
          throw new Error('Invalid version format in action');
        }
        const userAppVersion = await this.userAppVersionModel.findOne({
          userId: createSubscriberActivityDto.userId,
        });
        if (userAppVersion) {
          // Update record if found
          if (createSubscriberActivityDto.platform === 'iPhone-app') {
            await this.userAppVersionModel.updateOne(
              { userId: createSubscriberActivityDto.userId },
              {
                appVersion: version,
                currentPlatform: createSubscriberActivityDto.platform,
                hasIos: true,
              },
            );
          } else if (createSubscriberActivityDto.platform === 'mobile-app') {
            await this.userAppVersionModel.updateOne(
              { userId: createSubscriberActivityDto.userId },
              {
                appVersion: version,
                currentPlatform: createSubscriberActivityDto.platform,
                hasAndroid: true,
              },
            );
          } else if (createSubscriberActivityDto.platform === 'web') {
            await this.userAppVersionModel.updateOne(
              { userId: createSubscriberActivityDto.userId },
              {
                appVersion: version,
                currentPlatform: createSubscriberActivityDto.platform,
                hasWeb: true,
              },
            );
          }
        } else {
          const userName = await this.subscriberModel
            .findById(createSubscriberActivityDto.userId)
            .select('name');
          // If no record found, create a new one
          const newRecord = {
            userId: createSubscriberActivityDto.userId,
            userName: userName.name,
            appVersion: version,
            currentPlatform: createSubscriberActivityDto.platform,
            hasIos: createSubscriberActivityDto.platform === 'iPhone-app',
            hasAndroid: createSubscriberActivityDto.platform === 'mobile-app',
            hasWeb: createSubscriberActivityDto.platform === 'web',
          };

          await this.userAppVersionModel.create(newRecord);
        }
      }
    }

    return this.baseResponse.sendResponse(
      200,
      message.subscriberActivity.SUBSCRIBER_ACTIVITY_CREATED,
      newSubscriberActivity,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Subscriber Activity');

    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );

    if (!adminUser) {
      throw new HttpException('Admin User not found', HttpStatus.NOT_FOUND);
    }
    if (
      adminUser.isAllState !== true &&
      !paginationDto.state &&
      adminUser.state
    ) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (
      adminUser.isAllDistrict !== true &&
      !paginationDto.district &&
      adminUser.district
    ) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);

    return await aggregate(this.subscriberActivityModel, paginationDto, query);
  }

  async subscriberActivityRecords(
    paginationDto: PaginationDto,
    userId: string,
  ) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      stateId,
      districtId,
      countries,
      blockId,
      cadreId,
      healthFacilityId,
      name,
      phoneNo,
      email,
      actions,
    } = paginationDto;

    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
    if (adminUser.isAllState !== true && !paginationDto.state) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true && !paginationDto.district) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);
    console.log('query-->', JSON.stringify(query), stateId);
    let records, usersIds;
    console.log('sortBy--->', sortBy);
    const { userIdFilter, ...rest } = paginationDto;
    rest.usersId = userIdFilter;
    const queryByUserId = await this.filterService.filter(rest);
    if (
      stateId ||
      districtId ||
      blockId ||
      countries ||
      cadreId ||
      healthFacilityId ||
      name ||
      phoneNo ||
      email ||
      actions
    ) {
      usersIds = await this.subscriberModel
        .find(query)
        .select('_id')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .lean();
      if (actions) {
        records = await this.subscriberActivityModel
          .find({
            userId: {
              $in: usersIds.map(
                (user) => new mongoose.Types.ObjectId(user._id),
              ),
            },
            action: new RegExp(actions, 'i'),
          })
          .skip(Number(limit) * (Number(page) - 1))
          .limit(Number(limit))
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
      } else {
        records = await this.subscriberActivityModel
          .find({
            userId: {
              $in: usersIds.map(
                (user) => new mongoose.Types.ObjectId(user._id),
              ),
            },
          })
          .skip(Number(limit) * (Number(page) - 1))
          .limit(Number(limit))
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
      }
    } else {
      records = await this.subscriberActivityModel
        .find(queryByUserId)
        .skip(Number(limit) * (Number(page) - 1))
        .limit(Number(limit))
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
      usersIds = records.map((r) => r.userId?._id?.toString()).filter(Boolean);
    }

    // Fetch users separately
    const users = await this.subscriberModel
      .find({ _id: { $in: usersIds } })
      .select(
        '_id name email phoneNo countryId stateId districtId blockId healthFacilityId cadreId createdAt updatedAt',
      ) // Use .select() instead of .project()
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Extract related entity IDs
    const relatedIds = {
      countryIds: users.map((u) => u.countryId).filter(Boolean),
      stateIds: users.map((u) => u.stateId).filter(Boolean),
      districtIds: users.map((u) => u.districtId).filter(Boolean),
      blockIds: users.map((u) => u.blockId).filter(Boolean),
      healthFacilityIds: users.map((u) => u.healthFacilityId).filter(Boolean),
      cadreIds: users.map((u) => u.cadreId).filter(Boolean),
    };
    // Fetch related data
    const [country, states, districts, blocks, healthFacilities, cadres] =
      await Promise.all([
        relatedIds.countryIds.length
          ? this.countryModel.find({ _id: { $in: relatedIds.countryIds } })
          : [],
        relatedIds.stateIds.length
          ? this.stateModel.find({ _id: { $in: relatedIds.stateIds } })
          : [],
        relatedIds.districtIds.length
          ? this.districtModel.find({ _id: { $in: relatedIds.districtIds } })
          : [],
        relatedIds.blockIds.length
          ? this.blockModel.find({ _id: { $in: relatedIds.blockIds } })
          : [],
        relatedIds.healthFacilityIds.length
          ? this.healthFacilityModel.find({
              _id: { $in: relatedIds.healthFacilityIds },
            })
          : [],
        relatedIds.cadreIds.length
          ? this.cadreModel
              .find({ _id: { $in: relatedIds.cadreIds } })
              .populate('cadreGroup', 'title')
          : [],
      ]);

    // Create maps for quick lookup
    const createMap = (items, key = '_id', value = 'title') =>
      new Map(items.map((i) => [i[key]?.toString(), i[value]]));

    const countryMap = createMap(country);
    const stateMap = createMap(states);
    const districtMap = createMap(districts);
    const blockMap = createMap(blocks);
    const healthFacilityMap = createMap(
      healthFacilities,
      '_id',
      'healthFacilityCode',
    );
    const cadreMap = createMap(cadres);
    const defaultUser = {
      name: '',
      phoneNo: '',
      email: '',
      countryId: '',
      stateId: '',
      cadreId: '',
      districtId: '',
      blockId: '',
      healthFacilityId: '',
    };
    console.log('records length --->', records.length);
    const enrichedRecords = records.map((r) => {
      const user = userMap.get(r.userId?.toString()) || defaultUser;
      return {
        ...r.toObject(),
        userData: {
          name: user?.name || '',
          phoneNo: user?.phoneNo || '',
          email: user?.email || '',
          cadre: cadreMap.get(user.cadreId?.toString()) || '',
          country: countryMap.get(user.countryId?.toString()) || '',
          state: stateMap.get(user.stateId?.toString()) || '',
          district: districtMap.get(user.districtId?.toString()) || '',
          block: blockMap.get(user.blockId?.toString()) || '',
          healthFacility:
            healthFacilityMap.get(user.healthFacilityId?.toString()) || '',
        },
      };
    });
    // Get total count
    console.log(
      'condition -->',
      stateId ||
        districtId ||
        blockId ||
        countries ||
        cadreId ||
        healthFacilityId ||
        name ||
        phoneNo ||
        email ||
        actions,
    );
    let totalItems;
    if (
      stateId ||
      districtId ||
      blockId ||
      countries ||
      cadreId ||
      healthFacilityId ||
      name ||
      phoneNo ||
      email ||
      actions
    ) {
      // Use userId filtering when state-based filters exist
      if (actions) {
        totalItems = await this.subscriberActivityModel
          .countDocuments({
            userId: {
              $in: usersIds.map(
                (user) => new mongoose.Types.ObjectId(user._id),
              ),
            },
            action: new RegExp(actions, 'i'),
          })
          .exec();
      } else {
        totalItems = await this.subscriberActivityModel
          .countDocuments({
            userId: {
              $in: usersIds.map(
                (user) => new mongoose.Types.ObjectId(user._id),
              ),
            },
          })
          .exec();
      }
    } else {
      console.log('query qwww-->', JSON.stringify(queryByUserId), stateId);
      // Use full query when no userId filtering is needed
      totalItems = await this.subscriberActivityModel
        .countDocuments(queryByUserId)
        .exec();
      console.log('totalItems-->', totalItems);
    }

    const totalPages = Math.ceil(totalItems / limit);
    return {
      status: true,
      message: 'Data retrieved successfully',
      data: {
        list: enrichedRecords,
        totalItems,
        currentPage: Number(page),
        totalPages,
      },
      code: 200,
    };
  }

  async getAllActions() {
    console.log('This action return all unique actions --->');
    const actions = await this.subscriberActivityModel.distinct('action');
    return this.baseResponse.sendResponse(
      200,
      message.subscriberActivity.SUBSCRIBER_ACTIVITY_LIST,
      actions,
    );
  }

  async getAllSubscriberActivity(paginationDto: PaginationDto, userId: string) {
    console.log(
      `This Action returns all subscriber activity without pagination`,
    );
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
    if (adminUser.isAllState !== true && !paginationDto.state) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true && !paginationDto.district) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const {
      stateIds,
      districtIds,
      userCadreId,
      blockIds,
      country,
      userIds,
      userEmail,
      action,
      platform,
      fromDate,
      toDate,
      phoneNo,
      name,
    } = paginationDto;
    console.log('pagination Dto--->', paginationDto);
    /* Subscriber related Filters ------- */
    const userFilter: any = {};
    if (country) userFilter.countryId = new mongoose.Types.ObjectId(country);
    if (stateIds) {
      userFilter.stateId = {
        $in: stateIds.map((t) => new mongoose.Types.ObjectId(t)),
      };
    }
    if (districtIds) {
      userFilter.districtId = {
        $in: districtIds.map((t) => new mongoose.Types.ObjectId(t)),
      };
    }
    if (blockIds) {
      userFilter.blockId = {
        $in: blockIds.map((t) => new mongoose.Types.ObjectId(t)),
      };
    }
    if (userIds) {
      userFilter._id = {
        $in: userIds.map((t) => new mongoose.Types.ObjectId(t)),
      };
    }
    if (userEmail) userFilter.email = new RegExp(userEmail, 'i');
    if (phoneNo) userFilter.phoneNo = new RegExp(phoneNo, 'i');
    if (name) userFilter.name = new RegExp(name, 'i');
    if (userCadreId) {
      userFilter.cadreId = {
        $in: userCadreId.map((t) => new mongoose.Types.ObjectId(t)),
      };
    }

    const users = await this.subscriberModel
      .find(userFilter)
      .select('_id')
      .lean();
    const usersIds = users.map((u) => u._id);
    const otherFilter: any = {};
    otherFilter.action = new RegExp(action, 'i');
    otherFilter.platform = new RegExp(platform, 'i');
    if (fromDate || toDate) {
      const dateCondition: any = {}; // Temporary object for date conditions

      if (fromDate) {
        dateCondition['$gte'] = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        dateCondition['$lte'] = endDate;
      }

      // Push createdAt condition into andConditions array
      otherFilter.push({ createdAt: dateCondition });
    }
    console.log('usersIds-->', usersIds.length);
    const subscriberActivity = [
      {
        $match: {
          userId: { $in: usersIds },
          ...otherFilter,
          // ...query, // other filters like action, module, etc.
        },
      },
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      // All lookups use `user.` path now (like user.countryId)
      {
        $lookup: {
          from: 'countries',
          localField: 'user.countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'user.stateId',
          foreignField: '_id',
          as: 'state',
        },
      },
      // ... other lookups (cadre, district, etc.)
      {
        $lookup: {
          from: 'cadres',
          localField: 'user.cadreId',
          foreignField: '_id',
          as: 'cadre',
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'user.districtId',
          foreignField: '_id',
          as: 'district',
        },
      },
      {
        $lookup: {
          from: 'blocks',
          localField: 'user.blockId',
          foreignField: '_id',
          as: 'block',
        },
      },
      {
        $lookup: {
          from: 'healthfacilities',
          localField: 'user.healthFacilityId',
          foreignField: '_id',
          as: 'healthFacility',
        },
      },
      {
        $project: {
          name: '$user.name',
          phoneNo: '$user.phoneNo',
          email: '$user.email',
          cadreType: '$user.cadreType',
          country: {
            $ifNull: [{ $arrayElemAt: ['$country.title', 0] }, ''],
          },
          state: {
            $ifNull: [{ $arrayElemAt: ['$state.title', 0] }, ''],
          },
          cadre: {
            $ifNull: [{ $arrayElemAt: ['$cadre.title', 0] }, ''],
          },
          district: {
            $ifNull: [{ $arrayElemAt: ['$district.title', 0] }, ''],
          },
          block: {
            $ifNull: [{ $arrayElemAt: ['$block.title', 0] }, ''],
          },
          healthFacility: {
            $ifNull: [
              { $arrayElemAt: ['$healthFacility.healthFacilityCode', 0] },
              '',
            ],
          },
          action: 1,
          module: 1,
          subModule: 1,
          ipAddress: 1,
          platform: 1,
          totalTime: 1,
          timeSpent: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S',
              date: { $toDate: '$createdAt' },
              timezone: 'Asia/Kolkata',
            },
          },
        },
      },
    ];

    const result = await this.subscriberActivityModel
      .aggregate(subscriberActivity)
      .exec();
    // console.log('result length -->', result.length);
    return this.baseResponse.sendResponse(
      200,
      message.subscriberActivity.SUBSCRIBER_ACTIVITY_LIST,
      result,
    );
  }
  async getAllActivites(userId: string) {
    const userTask = await this.LeaderBoardServices.getTasksGroupedByLevel();
    const usersActivity = await this.subscriberActivityModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            module: '$module',
            action: '$action',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          module: '$_id.module',
          action: '$_id.action',
          count: 1,
        },
      },
    ]);

    const taskProgressByLevel = userTask.data.map((levelData) => {
      // Calculate task progress for each task in the current level
      const taskProgress = levelData.tasks.map((task) => {
        // Find all matching user activities for actions that exist as keys in `task`
        const taskActionsProgress = usersActivity
          .filter((activity) => {
            // Check if action is a key in task, or if it should be mapped to a specific count
            return (
              activity.action in task ||
              [
                'Chat Keyword Fetched',
                'Search By Keyword Fetched',
                'user_home_page_visit',
                'Kbase Course Fetched',
              ].includes(activity.action)
            );
          })
          .map((activity) => {
            const currentCount = activity.count || 0;

            // Set target based on the special cases or directly from task
            let target;
            if (
              ['Chat Keyword Fetched', 'Search By Keyword Fetched'].includes(
                activity.action,
              )
            ) {
              target = task.chatbotUsageCount || 0;
            } else if (activity.action === 'user_home_page_visit') {
              target = task.appOpenedCount || 0;
            } else if (['Kbase Course Fetched'].includes(activity.action)) {
              console.log(
                'checking-------',
                task.kbaseCompletion,
                ['Kbase Course Fetched'].includes(activity.action),
              );
              target = task.kbaseCompletion || 0;
            } else {
              target = task[activity.action] || 0;
            }

            return {
              action: activity.action,
              progress: `${currentCount}/${target}`, // Format as 'currentCount/target'
            };
          });

        return {
          badge_name: task.badge_name,
          progress: taskActionsProgress, // Include detailed progress for each action
        };
      });

      return {
        level: levelData.level,
        taskProgress, // Include task progress for this level
      };
    });

    return {
      status: true,
      message: 'Task progress fetched successfully',
      data: taskProgressByLevel, // Return task progress data grouped by level
    };
  }

  async generateCsv(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true, // Include column headers
          columns: [
            { key: 'name', header: 'Name' },
            { key: 'phoneNo', header: 'Phone Number' },
            { key: 'email', header: 'Email' },
            { key: 'country', header: 'Country' },
            { key: 'state', header: 'State' },
            { key: 'cadreType', header: 'Cadre Type' },
            { key: 'cadre', header: 'Cadre' },
            { key: 'district', header: 'District' },
            { key: 'block', header: 'Block' },
            { key: 'healthFacility', header: 'Health Facility' },
            { key: 'action', header: 'Action' },
            { key: 'module', header: 'Module' },
            { key: 'subModule', header: 'Sub-module' },
            { key: 'platform', header: 'Platform' },
            { key: 'timeSpent', header: 'Time-Spent' },
            { key: 'createdAt', header: 'Created At' },
          ],
        },
        (err, output) => {
          if (err) {
            return reject(err);
          }
          resolve(output);
        },
      );
    });
  }

  async scriptForSubscriberActivity() {
    console.log(`This action return subscriber activity migration`);
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Documents/subscriber_activity_half.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const BATCH_SIZE = 1000; // Define a suitable batch size
    let batch = [];
    for (const record of jsonData) {
      console.log('record user id and id--->', record.user_id, record.id);
      if (record.deleted_at !== null) {
        const subscriber = await this.subscriberModel
          .findOne({ id: record.user_id })
          .select('_id');
        const result = {
          userId: subscriber ? subscriber._id : null,
          module: record.action,
          action: record.action,
          ipAddress: record.ip_address,
          platform: record.plateform,
          payload: record.payload,
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.updated_at),
          id: record.id,
        };
        batch.push(result);
      }
      if (batch.length >= BATCH_SIZE) {
        await this.subscriberActivityModel.insertMany(batch);
        console.log(`Inserted batch of ${batch.length} records`);
        batch = [];
      }
      // break;
    }
  }
}
