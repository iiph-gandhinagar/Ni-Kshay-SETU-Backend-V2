import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { AssessmentEnrollmentDocument } from 'src/assessment-enrollment/entities/assessment-enrollment.entity';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { CountryDocument } from 'src/country/entities/country.entity';
import { DistrictDocument } from 'src/district/entities/district.entity';
import { OldAssessmentResultDocument } from 'src/old-assessment-result/entities/old-assessment-result.entity';
import { PrimaryCadreDocument } from 'src/primary-cadre/entities/primary-cadre.entity';
import { QuestionBankDocument } from 'src/question-bank/entities/question-bank.entity';
import { StateDocument } from 'src/state/entities/state.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { ActiveFlagDto } from './dto/active-flag.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { StoreAssessmentEnrollmentDto } from './dto/store-assessment-enrollment.dto';
import { StoreProAssessmentDto } from './dto/store-pro-assessment.dto';
import { StoreWeeklyGoalDto } from './dto/store-weekly-goal.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AssessmentDocument } from './entities/assessment.entity';

dotenv.config();

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('State')
    private readonly stateModel: Model<StateDocument>,
    @InjectModel('District')
    private readonly districtModel: Model<DistrictDocument>,
    @InjectModel('Country')
    private readonly countryModel: Model<CountryDocument>,
    @InjectModel('QuestionBank')
    private readonly questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('AssessmentEnrollment')
    private readonly assessmentEnrollmentModel: Model<AssessmentEnrollmentDocument>,
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('PrimaryCadre')
    private readonly primaryCadreModel: Model<PrimaryCadreDocument>,
    @InjectModel('OldAssessmentResult')
    private readonly oldAssessmentResult: Model<OldAssessmentResultDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<AssessmentDocument> {
    console.log('inside find by property Assessment----->');
    return this.assessmentModel.findOne({ [property]: value }).exec();
  }

  async create(createAssessmentDto: CreateAssessmentDto, userId: string) {
    console.log('This action adds a new Assessment');
    createAssessmentDto.countryId = new mongoose.Types.ObjectId(
      createAssessmentDto.countryId,
    );
    if (createAssessmentDto.stateId && createAssessmentDto.stateId.length > 0) {
      if (!createAssessmentDto.stateId.includes('ALL')) {
        createAssessmentDto.stateId = createAssessmentDto.stateId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    if (
      createAssessmentDto.districtId &&
      createAssessmentDto.districtId.length > 0
    ) {
      if (!createAssessmentDto.districtId.includes('ALL')) {
        createAssessmentDto.districtId = createAssessmentDto.districtId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    if (createAssessmentDto.cadreId && createAssessmentDto.cadreId.length > 0) {
      if (!createAssessmentDto.cadreId.includes('ALL')) {
        createAssessmentDto.cadreId = createAssessmentDto.cadreId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }

    if (createAssessmentDto.blockId && createAssessmentDto.blockId.length > 0) {
      if (!createAssessmentDto.blockId.includes('ALL')) {
        createAssessmentDto.blockId = createAssessmentDto.blockId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }

    if (
      createAssessmentDto.healthFacilityId &&
      createAssessmentDto.healthFacilityId.length > 0
    ) {
      if (!createAssessmentDto.healthFacilityId.includes('ALL')) {
        createAssessmentDto.healthFacilityId =
          createAssessmentDto.healthFacilityId.map(
            (id) => new mongoose.Types.ObjectId(id),
          );
      }
    }

    createAssessmentDto.createdBy = new mongoose.Types.ObjectId(userId);
    createAssessmentDto.certificateType = new mongoose.Types.ObjectId(
      createAssessmentDto.certificateType,
    );
    if (
      createAssessmentDto.newQuestions &&
      createAssessmentDto.newQuestions.length > 0
    ) {
      for (const item of createAssessmentDto.newQuestions) {
        item.isVisible = false;
        const newQuestionBank = await this.questionBankModel.create(item);
        if (!createAssessmentDto.questions) {
          createAssessmentDto.questions = [];
        }
        createAssessmentDto.questions.push(
          newQuestionBank._id as mongoose.Types.ObjectId,
        );
      }
    }
    createAssessmentDto.questions = createAssessmentDto.questions.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const newAssessment =
      await this.assessmentModel.create(createAssessmentDto);
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_CREATED,
      newAssessment,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Assessment');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'countryId', select: 'title' },
      { path: 'stateId', select: 'title' },
      { path: 'districtId', select: 'title' },
      { path: 'blockId', select: 'title' },
      { path: 'healthFacilityId', select: 'healthFacilityCode' },
      { path: 'cadreId', select: 'title' },
      { path: 'questions' },
      { path: 'createdBy', select: 'firstName lastName email ' },
    ];
    const query = await this.filterService.filter(paginationDto);
    const updatedQuery = await this.adminService.adminRoleFilter(
      userId,
      query,
      'assessment',
    );
    return await paginate(
      this.assessmentModel,
      paginationDto,
      statePopulateOptions,
      updatedQuery,
    );
  }
  async assessmentFilter() {
    console.log(`This Action return all assessment name`);
    const assessments = await this.assessmentModel.find().select('title');
    return this.baseResponse.sendResponse(
      200,
      'Assessment Fetched Successfully!',
      assessments,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Assessment`);
    const getAssessmentById = await this.assessmentModel
      .findById(id)
      .populate([
        { path: 'countryId', select: 'title' },
        { path: 'stateId', select: 'title' },
        { path: 'districtId', select: 'title' },
        { path: 'cadreId', select: 'title' },
        { path: 'blockId', select: 'title' },
        { path: 'healthFacilityId', select: 'healthFacilityCode' },
        { path: 'questions' },
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_LIST,
      getAssessmentById,
    );
  }

  async update(id: string, updateAssessmentDto: UpdateAssessmentDto) {
    console.log(`This action updates a #${id} Assessment`);
    const data = await this.assessmentResponseModel
      .find({ assessmentId: id })
      .countDocuments();
    if (data > 0) {
      throw new HttpException(
        {
          message: 'assessment cant delete',
          errors: 'Assessment cant delete',
        },
        HttpStatus.BAD_REQUEST,
      );
      // return this.baseResponse.sendError(400, 'Assessment cant delete', []);
    }
    if (updateAssessmentDto.countryId) {
      updateAssessmentDto.countryId = new mongoose.Types.ObjectId(
        updateAssessmentDto.countryId,
      );
    }
    if (updateAssessmentDto.stateId) {
      if (!updateAssessmentDto.stateId.includes('ALL')) {
        updateAssessmentDto.stateId = updateAssessmentDto.stateId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    if (updateAssessmentDto.districtId) {
      if (!updateAssessmentDto.districtId.includes('ALL')) {
        updateAssessmentDto.districtId = updateAssessmentDto.districtId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    if (updateAssessmentDto.blockId) {
      if (!updateAssessmentDto.blockId.includes('ALL')) {
        updateAssessmentDto.blockId = updateAssessmentDto.blockId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    if (updateAssessmentDto.healthFacilityId) {
      if (!updateAssessmentDto.healthFacilityId.includes('ALL')) {
        updateAssessmentDto.healthFacilityId =
          updateAssessmentDto.healthFacilityId.map(
            (id) => new mongoose.Types.ObjectId(id),
          );
      }
    }
    if (updateAssessmentDto.cadreId) {
      if (!updateAssessmentDto.cadreId.includes('ALL')) {
        updateAssessmentDto.cadreId = updateAssessmentDto.cadreId.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }
    const updateDetails = await this.assessmentModel
      .findByIdAndUpdate(id, updateAssessmentDto, { new: true })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Assessment`);
    const data = await this.assessmentResponseModel
      .find({ assessmentId: id })
      .countDocuments();
    if (data > 0) {
      throw new HttpException(
        {
          message: 'assessment cant delete',
          errors: 'Assessment cant delete',
        },
        HttpStatus.BAD_REQUEST,
      );
      // return this.baseResponse.sendError(400, 'Assessment cant delete', []);
    }
    await this.assessmentModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_DELETE,
      [],
    );
  }

  async storeWeeklyGoal(
    userId: string,
    storeWeeklyGoalDto: StoreWeeklyGoalDto,
    lang: string,
  ) {
    const { goal } = storeWeeklyGoalDto;
    console.log(
      `This action set weekly goal of user ${userId} and goal is ${goal}`,
    );
    const user = await this.subscriberModel.findById(userId);
    if (!user) {
      throw new HttpException(
        {
          message: 'User Not Found',
          errors: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.subscriberModel.findByIdAndUpdate(
      userId,
      {
        'userContext.weeklyAssessmentCount': goal,
      },
      { new: true },
    );
    const cadre = await this.subscriberModel.findById(userId).select('cadreId');
    const primaryCadre = await this.cadreModel
      .findById(cadre.cadreId)
      .select('cadreGroup');
    const audienceId = await this.primaryCadreModel
      .findById(primaryCadre.cadreGroup)
      .select('audienceId');
    const url = process.env.ASSESSMENT_URL + '/update_user_preferences';
    await axios.post(url, {
      user_id: new mongoose.Types.ObjectId(userId),
      assessment_count: goal,
      lang: lang ? lang : 'en',
      cadre_id: audienceId.audienceId,
    });
    return this.baseResponse.sendResponse(
      200,
      'Weekly Goal Updated Successfully!',
      [],
    );
  }

  async buildQuery(assessment: any) {
    const baseQuery = {};
    if (!assessment.isAllCadre && assessment.cadreId) {
      baseQuery['cadreId'] = {
        $in: assessment.cadreId,
      };
    }
    if (
      assessment.cadreType &&
      assessment.cadreType.includes('National_Level')
    ) {
      baseQuery['countryId'] = new mongoose.Types.ObjectId(
        assessment.countryId,
      );
    } else if (
      assessment.cadreType &&
      assessment.cadreType.includes('International_Level')
    ) {
    } else if (
      assessment.cadreType &&
      assessment.cadreType.includes('State_Level')
    ) {
      if (!assessment.isAllState && assessment.stateId.length > 0) {
        baseQuery['stateId'] = {
          $in: assessment.stateId,
        };
      }
    } else if (
      assessment.cadreType &&
      assessment.cadreType.includes('District_Level')
    ) {
      if (!assessment.isAllDistrict && assessment.districtId.length > 0) {
        baseQuery['districtId'] = {
          $in: assessment.districtId,
        };
      }
    } else if (
      assessment.cadreType &&
      assessment.cadreType.includes('Block_Level')
    ) {
      if (!assessment.isAllBlock && assessment.blockId.length > 0) {
        baseQuery['blockId'] = {
          $in: assessment.blockId,
        };
      }
    } else if (
      assessment.cadreType &&
      assessment.cadreType.includes('Health-facility_Level')
    ) {
      if (
        !assessment.isAllHealthFacility &&
        assessment.healthFacilityId.length > 0
      ) {
        baseQuery['healthFacilityId'] = {
          $in: assessment.healthFacilityId,
        };
      }
    }
    return baseQuery;
  }

  async sendInitialNotification(id: string, adminUserId: string) {
    const assessment = await this.assessmentModel.findById(id);
    const notification = {};
    const baseQuery = await this.buildQuery(assessment);
    const userId = await this.subscriberModel.find(baseQuery);
    if (!userId || userId.length === 0) {
      throw {
        statusCode: 400,
        message: 'No user found with the provided ID',
      };
    }
    const userIds = userId.map((s) => s._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: userIds },
      })
      .select('notificationToken');

    if (assessment.fromDate !== undefined || assessment.fromDate !== null) {
      notification['title'] = 'New Assessment';
      notification['description'] =
        `New Assessment added ${assessment.title}, Click here to enroll `;
      notification['automaticNotificationType'] = 'Future Assessment';
      notification['link'] =
        `${process.env.FRONTEND_URL}/currentAssessmentScreen`;
    } else {
      notification['title'] = 'New Assessment';
      notification['description'] =
        `New Assessment added ${assessment.title}, Click here to enroll `;
      notification['automaticNotificationType'] = 'Current Assessment';
      notification['link'] =
        `${process.env.FRONTEND_URL}/currentAssessmentScreen`;
    }
    notification['createdBy'] = new mongoose.Types.ObjectId(adminUserId);
    notification['assessmentTitle'] = assessment.title;
    notification['timeToComplete'] = assessment.timeToComplete;
    notification['isDeepLink'] = true;
    notification['typeTitle'] = new mongoose.Types.ObjectId(id);
    notification['userId'] = userId;
    notification['type'] = 'Automatic Notification';
    notification['status'] = 'Pending';
    const notificationData =
      await this.userNotificationModel.create(notification);
    if (deviceToken.length > 0) {
      await this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'assessment',
      );

      return this.baseResponse.sendResponse(
        200,
        'Notifications are in Queue!!',
        [],
      );
    }
  }
  async storeProAssessmentResult(
    userId: string,
    storeProAssessmentDto: StoreProAssessmentDto,
  ) {
    console.log(`This action store Pro assessment result of user ${userId}`);
    const { payload } = storeProAssessmentDto;
    /*  Call Python API ------>  */
    const url = process.env.ASSESSMENT_URL + '/update_assessment_submission';
    await axios.post(url, payload);
    return this.baseResponse.sendResponse(200, 'Pro Assessment Result!', []);
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
        { stateId: { $in: [user.stateId] } }, // Matches the user's specific stateId
        { isAllState: true }, // Allows assessments with 'All' in stateId
      ];
    } else if (user.cadreType === 'District_Level') {
      baseQuery['$or'] = [
        { districtId: { $in: [user.districtId] } }, // Matches the user's specific districtId
        { isAllDistrict: true }, // Allows assessments with 'All' in districtId
      ];
    } else if (user.cadreType === 'Block_Level') {
      baseQuery['$or'] = [
        { blockId: { $in: [user.blockId] } }, // Matches the user's specific blockId
        { isAllBlock: true }, // Allows assessments with 'All' in blockId
      ];
    } else if (user.cadreType === 'Health-facility_Level') {
      baseQuery['$or'] = [
        { healthFacilityId: { $in: [user.healthFacilityId] } }, // Matches the user's specific healthFacilityId
        { isAllHealthFacility: true }, // Allows assessments with 'All' in healthFacilityId
      ];
    }
    return baseQuery;
  }

  async getAllAssessment(userId: string) {
    console.log(`This action returns all current assessment of user ${userId}`);
    const user = await this.subscriberModel.findById(userId);
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const completedAssessment = await this.assessmentResponseModel
      .find({
        userId: new mongoose.Types.ObjectId(userId),
        isCalculated: true,
        createdAt: { $gte: last24Hours },
      })
      .select('assessmentId');
    // Extract the IDs of recent assessments
    const recentAssessmentIds = completedAssessment.map(
      (assessment) => assessment.assessmentId,
    );
    const baseQuery = await this.buildAssessmentQuery(user);

    // Adding additional conditions for specific functions
    if (recentAssessmentIds.length > 0) {
      baseQuery['_id'] = { $nin: recentAssessmentIds };
    }
    const assessment = await this.assessmentModel
      .find(baseQuery)
      .populate({ path: 'questions' })
      .sort({ createdAt: -1 });
    const validAssessments = assessment.filter((item) => {
      const currentDate = new Date();
      const startDatetime = new Date(item.fromDate); // Assuming field is 'startDatetime'
      const endDatetime = new Date(item.toDate); // Assuming field is 'endDatetime'

      // Check if it's not type 'planned' or if current date is within the range
      return (
        item.assessmentType !== 'Planned' ||
        (currentDate >= startDatetime && currentDate <= endDatetime)
      );
    });

    let concatAssessment;
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const assessments = await collection.findOne({
        user_id: userId,
      });
      if (assessments) {
        const createdDate = assessments.created_at;
        const updatedDate = assessments.updated_at;
        const pendingAssessments = assessments.assessments.filter(
          (assessment) => {
            assessment.createdAt = createdDate;
            assessment.updatedAt = updatedDate;
            return assessment.pending === 'yes';
          },
        );
        if (pendingAssessments.length > 0) {
          concatAssessment = validAssessments.concat(pendingAssessments);
        } else {
          concatAssessment = validAssessments;
        }
      } else {
        concatAssessment = validAssessments;
      }
    } catch (error) {
      console.error('Error performing operation:', error);
      throw new HttpException(
        {
          message: 'Pro Assessment Error!',
          errors: 'Pro Assessment Error!',
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
    /* end  ---------------- */
    // console.log('base query -->', JSON.stringify(baseQuery, null, 2));

    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_LIST,
      concatAssessment,
    );
  }

  async getAllPastAssessment(userId: string) {
    console.log(`This action returns all Past assessment of user ${userId}`);
    const pastAssessment = await this.assessmentResponseModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isCalculated: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: '$assessmentId',
          mostRecentAssessment: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'assessments', // The name of the Assessment collection
          localField: '_id', // Field in the current collection (assessmentId)
          foreignField: '_id', // Field in the Assessment collection
          as: 'assessmentDetails', // Name for the resulting array
        },
      },
      {
        $unwind: '$assessmentDetails', // Unwind the array to get a single object
      },
      {
        $project: {
          _id: 0, // Remove the _id from the result
          assessmentId: '$_id',
          // mostRecentAssessment: 1,
          userAssessmentId: '$mostRecentAssessment._id',
          'assessmentDetails.title': 1, // Only include the title in the result
          'assessmentDetails.questions': 1, // Only include the title in the result
          'assessmentDetails.timeToComplete': 1, // Only include the title in the result
          'assessmentDetails.active': 1, // Only include the title in the result
        },
      },
    ]);
    let concatAssessment;
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const assessments = await collection.findOne({ user_id: userId });
      const givenAssessment = assessments.assessments.filter((item) => {
        if (item.pending.toLowerCase() === 'no') {
          return item;
        }
      });
      concatAssessment = pastAssessment.concat(givenAssessment);
    } catch (error) {
      console.error('Error performing operation:', error);
      concatAssessment = pastAssessment;
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }

    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_LIST,
      concatAssessment,
    );
  }

  async futureAssessment(userId: string) {
    console.log(`This Action return future assessment of userId ${userId}`);
    const user = await this.subscriberModel.findById(userId);
    const baseQuery = await this.buildAssessmentQuery(user);

    // Adding additional conditions for specific functions
    baseQuery['assessmentType'] = 'planned';
    baseQuery['fromDate'] = { $gte: new Date() };
    const futureAssessment = await this.assessmentModel
      .find(baseQuery)
      .populate({ path: 'questions' });

    /* Get Assessment Enrollment Response of user for this all future assessment */
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_LIST,
      futureAssessment,
    );
  }

  async assessmentPerformance(userId: string) {
    console.log(`This action returns ${userId} assessment performance`);
    const user = await this.subscriberModel.findById(userId);
    const baseQuery = await this.buildAssessmentQuery(user);

    // Adding additional conditions for specific functions
    baseQuery['$or'] = [
      { assessmentType: 'real-time' }, // Get real-time assessments directly
      {
        assessmentType: 'planned',
        toDate: { $lt: new Date() }, // Get planned assessments where toDate is less than the current date
      },
    ];
    const performance = await this.assessmentModel.find(baseQuery).lean(true);

    const completedAssessment = await this.assessmentResponseModel
      .find({
        userId: userId,
        assessmentId: { $in: performance.map((assessment) => assessment._id) },
      })
      .lean(true);
    const uniqueAssessmentIds = new Set();

    completedAssessment.forEach((assessment) => {
      const assessmentId = assessment.assessmentId.toString();
      // Add the assessmentId to the Set
      uniqueAssessmentIds.add(assessmentId);
    });

    const uniqueAssessmentCount = uniqueAssessmentIds.size;

    // Calculate the sum of obtained marks for unique assessments
    let sum = 0;

    completedAssessment.forEach((completed) => {
      if (
        uniqueAssessmentIds.has(completed.assessmentId.toString()) &&
        completed.totalMarks > 0
      ) {
        sum += completed.obtainedMarks / completed.totalMarks;
      }
    });

    // Calculate average
    const average =
      uniqueAssessmentCount > 0
        ? Math.round((sum / uniqueAssessmentCount) * 10000) / 100
        : 0;
    // Prepare response object
    const newRequest = {
      totalAssessmentCount: performance.length,
      completeAssessment: completedAssessment.length,
      accuracy: average,
    };
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_LIST,
      newRequest,
    );
  }

  async storeAssessmentEnrollment(
    storeAssessmentEnrollmentDto: StoreAssessmentEnrollmentDto,
    userId: string,
  ) {
    const { assessmentId, response } = storeAssessmentEnrollmentDto;

    // Find the user by token
    const subscriber = await this.subscriberModel
      .findById(userId)
      .select('_id')
      .lean();

    if (!subscriber) {
      throw new HttpException(
        {
          message: 'User Not Found',
          errors: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
      // return this.baseResponse.sendError(400, 'User not found', []);
    }

    console.log(`User ID found: ${userId}`);

    // Update or create the enrollment record
    await this.assessmentEnrollmentModel
      .findOneAndUpdate(
        { assessmentId: assessmentId, userId: userId },
        { response },
        { new: true, upsert: true }, // upsert will insert if not found
      )
      .lean();

    return this.baseResponse.sendResponse(
      200,
      'Your Response Store Successfully!!',
      [],
    );
  }

  async copyAssessment(assessmentId: string) {
    console.log(
      `This action copy whole assessment with question:${assessmentId}`,
    );
    const assessment = await this.assessmentModel.findById(assessmentId).lean();
    if (!assessment) {
      throw new HttpException(
        {
          message: 'Assessment not found',
          errors: 'Assessment not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    (assessment.title as { en: string }).en =
      (assessment.title as { en: string }).en + '_' + new Date().toISOString();
    assessment.active = false;
    assessment.isCopy = true;
    delete assessment._id;
    const newAssessment = await this.assessmentModel.create(assessment);
    return this.baseResponse.sendResponse(
      200,
      message.assessment.ASSESSMENT_COPY,
      newAssessment,
    );
  }

  async activeFlagValidation(activeFlagDto: ActiveFlagDto) {
    console.log(`This action validate active flag enable or not`);
    const { assessmentId, active } = activeFlagDto;
    console.log(
      'assessmentId and active flag action --->',
      assessmentId,
      active,
    );
    const assessment = await this.assessmentModel.findById(assessmentId);

    if (!assessment) {
      throw new HttpException(
        {
          message: 'Assessment not found',
          errors: 'Assessment not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (assessment.fromDate) {
      const fromDate = new Date(assessment.fromDate); // Convert to Date object
      const currentDate = new Date(); // Get the current date and time

      // Compare if fromDate is in the past
      if (fromDate < currentDate) {
        // Throw an error if the fromDate is less than the current date
        throw new HttpException(
          {
            message: 'Time up: fromDate is in the past',
            errors: 'Time up: fromDate is in the past',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.assessmentModel.findByIdAndUpdate(
        assessmentId,
        { active: active },
        { new: true },
      );
    } else {
      console.log('inside else part -->');
      await this.assessmentModel.findByIdAndUpdate(
        assessmentId,
        { active: active },
        { new: true },
      );
    }

    return this.baseResponse.sendResponse(
      200,
      'Status Update Successfully!',
      [],
    );
  }

  async assessmentQuestionReport(assessmentId: string) {
    console.log(`This action returns assessment with question report`);
    const assessment = await this.assessmentModel
      .findById(assessmentId)
      .populate({ path: 'questions' })
      .lean(true);
    if (!assessment) {
      throw new HttpException(
        {
          message: 'Assessment not found',
          errors: 'Assessment not found',
        },
        HttpStatus.NOT_FOUND,
      );
      // return this.baseResponse.sendError(404, 'Assessment not found', null);
    }
    return this.baseResponse.sendResponse(
      200,
      'Assessment With Question Report!',
      assessment,
    );
  }

  async assessmentResultReport(assessmentId: string) {
    console.log(
      `This action returns subscriber result of assessment ${assessmentId} `,
    );
    const assessment = await this.assessmentModel
      .findById(assessmentId)
      .populate({ path: 'questions' })
      .lean(true);
    if (!assessment) {
      throw new HttpException(
        {
          message: 'Assessment not found',
          errors: 'Assessment not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const assessmentResponse = await this.assessmentResponseModel
      .find({ assessmentId: new mongoose.Types.ObjectId(assessmentId) })
      .populate([
        {
          path: 'assessmentId',
          select: 'title',
        },
        {
          path: 'userId',
          select:
            'name phoneNo cadreType stateId cadreId countryId districtId blockId healthFacilityId',
          populate: [
            {
              path: 'stateId',
              select: 'title',
            },
            {
              path: 'cadreId',
              select: 'title',
            },
            {
              path: 'countryId',
              select: 'title',
            },
            {
              path: 'districtId',
              select: 'title',
            },
            {
              path: 'blockId',
              select: 'title',
            },
            {
              path: 'healthFacilityId',
              select: 'healthFacilityCode',
            },
          ],
        },
        {
          path: 'history.questionId',
          model: 'QuestionBank',
        },
      ]);

    return this.baseResponse.sendResponse(
      200,
      'Assessment With Question Report!',
      assessmentResponse,
    );
  }

  async oldAssessmentResponseScript() {
    console.log(
      `This Action run a script that migrate old user assessment details`,
    );
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/assessment-remaining-data.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const BATCH_SIZE = 100; // Define a suitable batch size
    let batch = [];
    for (const record of jsonData) {
      let district, state;
      const cadreIds = record.cadre_id.split(',').map(Number);
      const cadre = await this.cadreModel
        .find({ id: { $in: cadreIds } })
        .select('_id');
      if (
        record.state_id !== 'null' &&
        record.state_id !== 'NULL' &&
        record.state_id !== ''
      ) {
        state = await this.stateModel
          .find({ id: { $in: record.state_id.split(',').map(Number) } })
          .select('_id');
      }
      if (
        record.district_id &&
        record.district_id !== 'NULL' &&
        record.district_id !== 'null' &&
        record.district_id !== ''
      ) {
        console.log('inside district with value', record.district_id);
        district = await this.districtModel
          .find({ id: { $in: record.district_id.split(',').map(Number) } })
          .select('_id');
      }
      console.log('after district checks -->');
      const country = await this.countryModel
        .findOne({
          id: record.country_id,
        })
        .select('_id');
      const subscriber = await this.subscriberModel
        .findOne({ id: record.user_id })
        .select('_id');
      console.log(
        'cadre.map((item) => item._id)',
        cadre.map((item) => item._id),
      );
      if (record.deleted_at !== null) {
        const result = {
          assessmentId: record.assessment_id,
          userId: subscriber._id,
          totalMarks: record.total_marks,
          totalTime: record.total_time,
          obtainedMarks: record.obtained_marks,
          attempted: record.attempted,
          rightAnswers: record.right_answers,
          wrongAnswers: record.wrong_answers,
          skipped: record.skipped,
          isCalculated: record.is_calculated,
          timeToComplete: record.time_to_complete,
          activated: record.activated,
          assessmentType: record.assessment_type,
          cadreId:
            record.cadre_id &&
            record.cadre_id !== 'NULL' &&
            record.cadre_id !== 'null' &&
            record.cadre_id !== ''
              ? cadre.map((item) => item._id)
              : null,
          cadreType: record.cadre_type,
          countryId: country ? country._id : null,
          districtId:
            record.district_id &&
            record.district_id !== 'NULL' &&
            record.district_id !== 'null' &&
            record.district_id !== ''
              ? district.map((item) => item._id)
              : null,
          fromDate:
            record.from_date &&
            record.from_date !== 'NULL' &&
            record.from_date !== ''
              ? record.from_date
              : null,
          toDate:
            record.to_date && record.to_date !== 'NULL' && record.to_date !== ''
              ? record.to_date
              : null,
          stateId:
            record.state_id !== null &&
            record.state_id !== 'null' &&
            record.state_id !== ''
              ? state.map((item) => item._id)
              : null,
          title: record.title,
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.updated_at),
        };
        batch.push(result);
      }
      if (batch.length >= BATCH_SIZE) {
        await this.oldAssessmentResult.insertMany(batch);
        console.log(`Inserted batch of ${batch.length} records`);
        batch = [];
      }
    }
  }
}
