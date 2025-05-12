import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import mongoose, { Model, Types } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { SurveyHistoryDocument } from 'src/survey-history/entities/survey-history.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { CreateSurveyMasterDto } from './dto/create-survey-master.dto';
import { UpdateSurveyMasterDto } from './dto/update-survey-master.dto';
import { SurveyMasterDocument } from './entities/survey-master.entity';
dotenv.config();

@Injectable()
export class SurveyMasterService {
  constructor(
    @InjectModel('SurveyMaster')
    private readonly surveyMasterModel: Model<SurveyMasterDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('SurveyHistory')
    private readonly surveyHistoryModel: Model<SurveyHistoryDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<SurveyMasterDocument> {
    console.log('inside find by property Survey----->');
    return this.surveyMasterModel.findOne({ [property]: value }).exec();
  }
  async create(createSurveyMasterDto: CreateSurveyMasterDto) {
    console.log('This action adds a new Survey');
    createSurveyMasterDto.countryId = new mongoose.Types.ObjectId(
      createSurveyMasterDto.countryId,
    );
    if (
      createSurveyMasterDto.stateId &&
      createSurveyMasterDto.stateId.length > 0
    ) {
      createSurveyMasterDto.stateId = createSurveyMasterDto.stateId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (
      createSurveyMasterDto.districtId &&
      createSurveyMasterDto.districtId.length > 0
    ) {
      createSurveyMasterDto.districtId = createSurveyMasterDto.districtId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (
      createSurveyMasterDto.cadreId &&
      createSurveyMasterDto.cadreId.length > 0
    ) {
      createSurveyMasterDto.cadreId = createSurveyMasterDto.cadreId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (
      createSurveyMasterDto.blockId &&
      createSurveyMasterDto.blockId.length > 0
    ) {
      createSurveyMasterDto.blockId = createSurveyMasterDto.blockId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (
      createSurveyMasterDto.healthFacilityId &&
      createSurveyMasterDto.healthFacilityId.length > 0
    ) {
      createSurveyMasterDto.healthFacilityId =
        createSurveyMasterDto.healthFacilityId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }

    const newSurvey = await this.surveyMasterModel.create(
      createSurveyMasterDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.survey.SURVEY_CREATED,
      newSurvey,
    );
  }

  async buildAssessmentQuery(user: any) {
    const baseQuery = {
      active: true, // Common condition
      $and: [
        {
          $or: [
            { cadreId: { $in: [new mongoose.Types.ObjectId(user.cadreId)] } },
            { isAllCadre: true },
          ],
        },
      ],
    };
    if (user.cadreType === 'National_Level') {
      baseQuery['countryId'] = user.countryId;
    } else if (user.cadreType === 'State_Level') {
      baseQuery['$or'] = [
        { stateId: { $in: [new mongoose.Types.ObjectId(user.stateId)] } },
        { isAllState: true },
      ];
    } else if (user.cadreType === 'District_Level') {
      baseQuery['$or'] = [
        { districtId: { $in: [new mongoose.Types.ObjectId(user.districtId)] } },
        { isAllDistrict: true },
      ];
    } else if (user.cadreType === 'Block_Level') {
      baseQuery['$or'] = [
        { blockId: { $in: [new mongoose.Types.ObjectId(user.blockId)] } },
        { isAllBlock: true },
      ];
    } else if (user.cadreType === 'Health-facility_Level') {
      baseQuery['$or'] = [
        {
          healthFacilityId: {
            $in: [new mongoose.Types.ObjectId(user.healthFacilityId)],
          },
        },
        { isAllHealthFacility: true },
      ];
    }
    return baseQuery;
  }

  async getSurvey(userId: string) {
    console.log(`This action return survey details for user:${userId}`);
    const subscriber = await this.subscriberModel.findById(userId).lean();
    if (!subscriber) {
      throw new HttpException(
        {
          message: 'Subscriber Not Found',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const baseQuery = await this.buildAssessmentQuery(subscriber);
    console.log('base query--->', JSON.stringify(baseQuery));
    const surveyMasters = await this.surveyMasterModel
      .find(baseQuery)
      .lean(true);
    // Filter out surveys already completed by the subscriber
    const surveys = await this.filterCompletedSurveys(
      surveyMasters,
      new Types.ObjectId(userId),
    );
    const doneSurveyLists = await this.surveyHistoryModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .populate({ path: 'surveyId' })
      .lean();

    const result = {
      surveyList: surveys,
      doneSurveyList: doneSurveyLists,
    };

    return this.baseResponse.sendResponse(200, 'Survey Details !', result);
  }

  private async filterCompletedSurveys(
    surveys: any,
    subscriberId: Types.ObjectId,
  ) {
    console.log(
      `This action return completed survey from history for user: ${subscriberId}`,
    );
    const filteredSurveys = [];

    for (const survey of surveys) {
      const existSurvey = await this.surveyHistoryModel.countDocuments({
        surveyId: survey._id,
        userId: subscriberId,
      });
      if (existSurvey === 0) {
        filteredSurveys.push(survey);
      }
    }

    return filteredSurveys;
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Survey');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.surveyMasterModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Survey`);
    const getSurveyById = await this.surveyMasterModel.findById(id).exec();
    return this.baseResponse.sendResponse(
      200,
      message.survey.SURVEY_LIST,
      getSurveyById,
    );
  }

  async findAllSurvey() {
    console.log(`This action returns all Survey`);
    const getSurveyById = await this.surveyMasterModel
      .find()
      .select('title.en')
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.survey.SURVEY_LIST,
      getSurveyById,
    );
  }

  async update(id: string, updateSurveyMasterDto: UpdateSurveyMasterDto) {
    console.log(`This action updates a #${id} Survey`);
    const recordsExist = await this.surveyHistoryModel
      .find({ surveyId: id })
      .countDocuments();
    if (recordsExist > 0) {
      throw new HttpException(
        {
          message: "Survey can't Update!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updateSurveyMasterDto.countryId) {
      updateSurveyMasterDto.countryId = new mongoose.Types.ObjectId(
        updateSurveyMasterDto.countryId,
      );
    }
    if (
      updateSurveyMasterDto.stateId &&
      updateSurveyMasterDto.stateId.length > 0
    ) {
      updateSurveyMasterDto.stateId = updateSurveyMasterDto.stateId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (
      updateSurveyMasterDto.districtId &&
      updateSurveyMasterDto.districtId.length > 0
    ) {
      updateSurveyMasterDto.districtId = updateSurveyMasterDto.districtId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }
    if (
      updateSurveyMasterDto.cadreId &&
      updateSurveyMasterDto.cadreId.length > 0
    ) {
      updateSurveyMasterDto.cadreId = updateSurveyMasterDto.cadreId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (
      updateSurveyMasterDto.blockId &&
      updateSurveyMasterDto.blockId.length > 0
    ) {
      updateSurveyMasterDto.blockId = updateSurveyMasterDto.blockId.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    if (
      updateSurveyMasterDto.healthFacilityId &&
      updateSurveyMasterDto.healthFacilityId.length > 0
    ) {
      updateSurveyMasterDto.healthFacilityId =
        updateSurveyMasterDto.healthFacilityId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
    }
    const updateDetails = await this.surveyMasterModel
      .findByIdAndUpdate(id, updateSurveyMasterDto, { new: true })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.survey.SURVEY_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Survey`);
    const recordsExist = await this.surveyHistoryModel
      .find({ surveyId: id })
      .countDocuments();
    if (recordsExist > 0) {
      throw new HttpException(
        {
          message: "Survey can't Delete!",
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.surveyMasterModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.survey.SURVEY_DELETE,
      [],
    );
  }

  async buildQuery(survey: any) {
    const baseQuery = {};
    if (!survey.isAllCadre && survey.cadreId) {
      baseQuery['cadreId'] = {
        $in: survey.cadreId,
      };
    }
    if (survey.cadreType === 'National_Level') {
      baseQuery['countryId'] = new mongoose.Types.ObjectId(survey.countryId);
    } else if (survey.cadreType === 'State_Level') {
      if (!survey.isAllState && survey.stateId.length > 0) {
        baseQuery['stateId'] = {
          $in: survey.stateId,
        };
      }
    } else if (survey.cadreType === 'District_Level') {
      if (!survey.isAllDistrict && survey.districtId.length > 0) {
        baseQuery['districtId'] = {
          $in: survey.districtId,
        };
      }
    } else if (survey.cadreType === 'Block_Level') {
      if (!survey.isAllBlock && survey.blockId.length > 0) {
        baseQuery['blockId'] = {
          $in: survey.blockId,
        };
      }
    } else if (survey.cadreType === 'Health-facility_Level') {
      if (!survey.isAllHealthFacility && survey.healthFacilityId.length > 0) {
        baseQuery['healthFacilityId'] = {
          $in: survey.healthFacilityId,
        };
      }
    }
    return baseQuery;
  }

  async sendInitialInvitation(id: string, adminUserId: string) {
    console.log(`This action send notification to subscriber`);
    const survey = await this.surveyMasterModel.findById(id);
    const baseQuery = await this.buildQuery(survey);
    const user = await this.subscriberModel.find(baseQuery);
    const userId = user.map((item) => item._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: userId },
      })
      .select('notificationToken');
    let notification = {};
    if (deviceToken.length > 0) {
      notification = {
        title: 'New Survey',
        description: survey.title ? survey.title['en'] : '',
        automaticNotificationType: 'Survey',
        userId: userId,
        link: `${process.env.FRONTEND_URL}/surveyTool`,
        createdBy: new mongoose.Types.ObjectId(adminUserId),
        status: 'Pending',
        isDeepLink: true,
        typeTitle: new mongoose.Types.ObjectId(id),
        type: 'Automatic Notification',
      };
      /* Store Details into Automatic Notification table */
      const notificationData =
        await this.userNotificationModel.create(notification);

      this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'survey',
      );

      return this.baseResponse.sendResponse(
        200,
        'Notifications are in Queue!!',
        [],
      );
    }
    await this.surveyMasterModel.findByIdAndUpdate(
      id,
      {
        sendInitialNotification: true,
      },
      { new: true },
    );
  }
}
