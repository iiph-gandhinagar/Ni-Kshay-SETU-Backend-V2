import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { stringify } from 'csv-stringify';
import { MongoClient } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { message } from 'src/common/assets/message.asset';
import { AssessmentResponseAggregate } from 'src/common/pagination/assessmentResponseAggregation.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { QuestionBankDocument } from 'src/question-bank/entities/question-bank.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateAssessmentResponseDto } from './dto/create-assessment-response.dto';
import { StoreQuestionAnswerDto } from './dto/store-question-answer.dto';
import { AssessmentResponseDocument } from './entities/assessment-response.entity';

@Injectable()
export class AssessmentResponseService {
  constructor(
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('QuestionBank')
    private readonly questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async create(createAssessmentResponseDto: CreateAssessmentResponseDto) {
    console.log('This action adds a new Assessment Response');
    createAssessmentResponseDto.assessmentId = new mongoose.Types.ObjectId(
      createAssessmentResponseDto.assessmentId,
    );
    createAssessmentResponseDto.userId = new mongoose.Types.ObjectId(
      createAssessmentResponseDto.userId,
    );
    const time = await this.assessmentModel
      .findById(createAssessmentResponseDto.assessmentId)
      .select('timeToComplete');
    createAssessmentResponseDto.totalTime = time.timeToComplete;
    const newAssessmentResponse = await this.assessmentResponseModel.create(
      createAssessmentResponseDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.assessmentResponse.ASSESSMENT_RESPONSE_CREATED,
      newAssessmentResponse,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Assessment');
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      )
      .exec();
    if (!adminUser) {
      throw new HttpException('Admin User not found', HttpStatus.NOT_FOUND);
    }
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);

    return await AssessmentResponseAggregate(
      this.assessmentResponseModel,
      paginationDto,
      query,
    );
  }

  async getAllResponse(paginationDto: PaginationDto, userId: string) {
    console.log(
      `This action returns all user assessment details without pagination`,
    );
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);
    const { state, district, cadre, country } = paginationDto;
    const assessmentResponse = [
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' }, // Convert userId array to an object
      {
        $lookup: {
          from: 'countries',
          localField: 'userId.countryId',
          foreignField: '_id',
          as: 'userId.country',
          pipeline: country
            ? [{ $match: { _id: new mongoose.Types.ObjectId(country) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'userId.stateId',
          foreignField: '_id',
          as: 'userId.state',
          pipeline: state
            ? [{ $match: { _id: new mongoose.Types.ObjectId(state) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'userId.cadreId',
          foreignField: '_id',
          as: 'userId.cadre',
          pipeline: cadre
            ? [{ $match: { _id: new mongoose.Types.ObjectId(cadre) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'userId.districtId',
          foreignField: '_id',
          as: 'userId.district',
          pipeline: district
            ? [{ $match: { _id: new mongoose.Types.ObjectId(district) } }]
            : [],
        },
      },
      {
        $lookup: {
          from: 'blocks',
          localField: 'userId.blockId',
          foreignField: '_id',
          as: 'userId.block',
        },
      },
      { $match: query },
      {
        $project: {
          name: '$userId.name',
          phoneNo: '$userId.phoneNo',
          email: '$userId.email',
          country: {
            $ifNull: [{ $arrayElemAt: ['$userId.country.title', 0] }, ''],
          },
          state: {
            $ifNull: [{ $arrayElemAt: ['$userId.state.title', 0] }, ''],
          },
          cadre: {
            $ifNull: [{ $arrayElemAt: ['$userId.cadre.title', 0] }, ''],
          },
          district: {
            $ifNull: [{ $arrayElemAt: ['$userId.district.title', 0] }, ''],
          },
          block: {
            $ifNull: [{ $arrayElemAt: ['$userId.block.title', 0] }, ''],
          },
          assessmentTitle: {
            $ifNull: [{ $arrayElemAt: ['$assessment.title.en', 0] }, ''],
          },
          totalMarks: 1,
          totalTime: 1,
          obtainedMarks: 1,
          attempted: 1,
          rightAnswer: 1,
          wrongAnswer: 1,
          skip: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S', // Custom date format
              date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
              timezone: 'Asia/Kolkata', // Convert to IST (Indian Standard Time)
            },
          },
          isCalculated: 1,
          percentage: {
            $cond: {
              if: { $gt: ['$totalMarks', 0] }, // Avoid division by zero
              then: {
                $multiply: [
                  { $divide: ['$obtainedMarks', '$totalMarks'] },
                  100,
                ],
              },
              else: 0, // Default to 0% if totalMarks is 0
            },
          },
        },
      },
    ];
    const nonNullChecks: any = {};
    if (country) nonNullChecks['userData.country'] = { $ne: null };
    if (state) nonNullChecks['userData.state'] = { $ne: null };
    if (cadre) nonNullChecks['userData.cadre'] = { $ne: null };
    if (district) nonNullChecks['userData.district'] = { $ne: null };
    // Add the conditional non-null check match stage if there are any conditions
    if (Object.keys(nonNullChecks).length > 0) {
      assessmentResponse.push({ $match: nonNullChecks });
    }
    const result = await this.assessmentResponseModel
      .aggregate(assessmentResponse)
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.assessmentResponse.ASSESSMENT_RESPONSE_LIST,
      result,
    );
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
            { key: 'cadre', header: 'Cadre' },
            { key: 'district', header: 'District' },
            { key: 'block', header: 'Block' },
            { key: 'assessmentTitle', header: 'Assessment Title' },
            { key: 'totalMarks', header: 'Total Marks' },
            { key: 'totalTime', header: 'Total Time' },
            { key: 'obtainedMarks', header: 'Obtained Marks' },
            { key: 'attempted', header: 'Attempted Questions' },
            { key: 'rightAnswer', header: 'Right Answers' },
            { key: 'wrongAnswer', header: 'Wrong Answers' },
            { key: 'skip', header: 'Skipped Questions' },
            { key: 'createdAt', header: 'Created At' },
            { key: 'isCalculated', header: 'Is Calculated' },
            { key: 'percentage', header: 'Percentage' },
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

  async storeAssessmentResponse(
    userId: string,
    storeQuestionAnswerDto: StoreQuestionAnswerDto,
    idFilter: any,
  ) {
    console.log(
      `This Action store question answer given by user ${storeQuestionAnswerDto}`,
    );
    const historyArray = {
      questionId: new mongoose.Types.ObjectId(
        storeQuestionAnswerDto.answer.questionId,
      ),
      answer: storeQuestionAnswerDto.answer.answer,
      isCorrect: storeQuestionAnswerDto.answer.isCorrect,
      isSubmit: storeQuestionAnswerDto.answer.isSubmit,
      selectedOption: storeQuestionAnswerDto.answer.selectedOption,
    };
    console.log(
      'idFilter ---.',
      idFilter,
      typeof idFilter,
      idFilter.idFilter,
      Object.keys(idFilter).length != 0,
    );
    /* Need To check if _id is exist then update exiting  */
    if (
      idFilter &&
      typeof idFilter == 'object' &&
      Object.keys(idFilter).length != 0
    ) {
      console.log('inside if --->');
      const updatedDetails =
        await this.assessmentResponseModel.findByIdAndUpdate(
          idFilter.idFilter, // Query to find the document by id
          {
            $push: { history: historyArray }, // Push the new entry into the history array
          },
          { new: true },
        );
      return this.baseResponse.sendResponse(
        200,
        'Store Question Answer Successfully!!',
        updatedDetails,
      );
    } else {
      const user = await this.subscriberModel.findById(userId);
      console.log('user --->', user);
      const answer = await this.questionBankModel.findById(
        storeQuestionAnswerDto.answer.questionId,
      );
      console.log('answer --->', answer);
      const totalTime = await this.assessmentModel
        .findById(storeQuestionAnswerDto.assessmentId)
        .select('timeToComplete questions');

      const result = {
        assessmentId: new mongoose.Types.ObjectId(
          storeQuestionAnswerDto.assessmentId,
        ),
        userId: new mongoose.Types.ObjectId(userId),
        totalTime: totalTime.timeToComplete,
        totalMarks: totalTime.questions ? totalTime.questions.length : 0,
        history: [historyArray],
      };
      const newAssessmentResponse =
        await this.assessmentResponseModel.create(result);
      return this.baseResponse.sendResponse(
        200,
        message.assessmentResponse.ASSESSMENT_RESPONSE_CREATED,
        newAssessmentResponse,
      );
    }
  }

  async getSubscriberAssessmentDetails(userId: string, assessmentId: string) {
    console.log(
      `this action return subscriber request assessment ${assessmentId} status and time remaining`,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const totalTime = await this.assessmentModel
      .findById(assessmentId)
      .select('timeToComplete');
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isAvailable = await this.assessmentResponseModel
      .findOne({
        assessmentId: new mongoose.Types.ObjectId(assessmentId),
        userId: new mongoose.Types.ObjectId(userId),
        isCalculated: false,
      })
      .sort({ createdAt: -1 })
      .lean(true);
    const totalMarks = await this.assessmentModel
      .findById(assessmentId)
      .select('questions');
    let isAssessmentAttempted = 0;
    let isAssessmentExpired = 0;
    let remainingTime = 0;
    let userAssessmentId;
    if (isAvailable) {
      const createdDate = (isAvailable as any).createdAt;
      const createdAt = new Date(createdDate); // Assuming isAvailable[0].createdAt is in ISO format
      const totalTimeInMinutes = isAvailable.totalTime; // Total time to complete (in minutes)
      const completionTime = new Date(
        createdAt.getTime() + totalTimeInMinutes * 60000,
      ); // Add total time in minutes to createdAt

      const currentTime = new Date();
      if (isAvailable.isCalculated == true || completionTime < currentTime) {
        isAssessmentAttempted = 1;
        isAssessmentExpired = 1;
        remainingTime = 0;
        userAssessmentId = isAvailable._id;
      } else {
        isAssessmentAttempted = 0;
        isAssessmentExpired = 0;
        remainingTime = Math.floor(
          (completionTime.getTime() - currentTime.getTime()) / 1000,
        ); // Remaining time in seconds
        userAssessmentId = isAvailable._id;
      }
    } else {
      const assessmentPresent = await this.assessmentResponseModel
        .findOne({
          assessmentId: new mongoose.Types.ObjectId(assessmentId),
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: last24Hours },
        })
        .sort({ createdAt: -1 })
        .lean(true);
      if (assessmentPresent) {
        throw new HttpException(
          {
            message:
              'You are not allowed to retake an assessment that has already been completed.',
            errors:
              'You are not allowed to retake an assessment that has already been completed.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = {
        assessmentId: new mongoose.Types.ObjectId(assessmentId),
        userId: new mongoose.Types.ObjectId(userId),
        totalMarks: totalMarks.questions.length,
        totalTime: totalTime.timeToComplete,
      };
      const userResponseId = await this.assessmentResponseModel.create(result);
      isAssessmentAttempted = 0;
      isAssessmentExpired = 0;
      remainingTime = totalTime.timeToComplete * 60;
      userAssessmentId = userResponseId._id;
    }
    const payload = {
      isAssessmentAttempted: isAssessmentAttempted,
      isAssessmentExpired: isAssessmentExpired,
      remainingTime: remainingTime,
      answers: isAvailable ? isAvailable.history : [],
      _id: userAssessmentId,
    };
    return this.baseResponse.sendResponse(
      200,
      'Assessment Progress Details',
      payload,
    );
  }

  async getUserResult(userId: string, userAssessmentId: string) {
    console.log(
      `This action return quick result of assessment ${userAssessmentId}`,
    );
    const assessment = await this.assessmentResponseModel
      .findById(userAssessmentId)
      .populate({ path: 'assessmentId', select: 'title.en' })
      .select(
        'obtainedMarks attempted rightAnswer wrongAnswer skip isCalculated totalTime totalMarks assessmentId createdAt updatedAt',
      )
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
    if (assessment.isCalculated === true) {
      return this.baseResponse.sendResponse(
        200,
        'Assessment Result!',
        assessment,
      );
    } else {
      const data = await this.calculateMarks(
        new mongoose.Types.ObjectId(userId),
        assessment.assessmentId,
      );
      return this.baseResponse.sendResponse(200, 'Result!', data);
    }
  }

  async getNotCalculatedAssessment() {
    console.log(
      `This action return all user assessment response whose isCalculated flag is false`,
    );
    const assessmentResponse = await this.assessmentResponseModel
      .find({ isCalculated: false })
      .lean(true);
    for (const item of assessmentResponse) {
      const createdAt = new Date((item as any).createdAt);
      const totalTimeInMinutes = item.totalTime || 0;
      const newDate = new Date(
        createdAt.getTime() + totalTimeInMinutes * 60000,
      );
      const formattedNewDate = newDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '); // Convert to ISO and format
      const formattedTimestamp = newDate.getTime();
      // Get the current date in 'Y-m-d H:i:s' format
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      const currentTImeTimestamp = new Date().getTime();

      console.log(
        'current date time --->',
        formattedNewDate,
        currentDate,
        'ISO date check',
        formattedNewDate < currentDate,
      );
      // Check if the new date is less than the current date
      if (formattedTimestamp < currentTImeTimestamp) {
        await this.calculateMarks(item.userId, item.assessmentId);
      } else {
        return false;
      }
    }
  }

  async calculateMarks(
    userId: mongoose.Types.ObjectId,
    assessmentId: mongoose.Types.ObjectId,
  ) {
    console.log(
      `This action Calculate total marks and other details ${assessmentId._id}`,
    );
    const userResponse = await this.assessmentResponseModel
      .find({
        userId: userId,
        assessmentId: assessmentId._id,
        isCalculated: false,
      })
      .populate({ path: 'assessmentId', select: 'title.en' })
      .lean(true);
    let result;
    if (userResponse && userResponse.length > 0) {
      let isCorrect = 0;
      let wrongAnswer = 0;
      for (const item of userResponse) {
        item.history.map((data) => {
          if (data.isCorrect == true) {
            isCorrect += 1;
          }
          if (data.isCorrect == false && data.answer !== null) {
            wrongAnswer += 1;
          }
        });
        result = {
          assessmentId: item.assessmentId,
          totalTime: item.totalTime,
          totalMarks: item.totalMarks,
          obtainedMarks: isCorrect,
          attempted: isCorrect + wrongAnswer,
          rightAnswer: isCorrect,
          wrongAnswer: wrongAnswer,
          skip: item.totalMarks - (isCorrect + wrongAnswer),
          isCalculated: true,
          // assessmentId: assessmentId._id,
          createdAt: (item as any).createdAt,
          updatedAt: (item as any).updatedAt,
        };
        const { assessmentId, ...resultWithoutAssessmentId } = result;
        console.log('assessmentId', assessmentId);
        await this.assessmentResponseModel.findByIdAndUpdate(
          item._id,
          resultWithoutAssessmentId,
          {
            new: true,
          },
        );
      }
      console.log('Correct answers:', isCorrect);
      console.log('Wrong answers:', wrongAnswer);
      return result;
    }
  }

  async proAssessmentScore(userId: string, assessmentId: string) {
    console.log(`This action returns pro assessment ${assessmentId} score`);
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const userDocs = await collection.find({ user_id: userId }).toArray();
      const assessments = userDocs.flatMap((doc) => doc.assessments || []);
      const assessment = assessments.filter((assessment) => {
        return assessment.assessment_id === assessmentId;
      });
      return this.baseResponse.sendResponse(
        200,
        'Pro Assessment Result',
        assessment,
      );
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async proAssessmentPerformance(userId: string) {
    console.log(
      `This action return pro assessments performance of user ${userId}`,
    );
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const assessments = await collection.findOne({
        user_id: userId,
      });
      /* Filter out completed assessment */
      const assessment = assessments.assessments.filter((assessment) => {
        return assessment.pending === 'no';
      });
      const completedAssessment = assessment.length;
      const totalAssessmentCount = assessments.assessments.length;
      /* Map Through all assessments and get accuracy */
      const totalCorrect = assessment.reduce(
        (sum, assessment) => sum + assessment.correct,
        0,
      );
      const totalIncorrect = assessment.reduce(
        (sum, assessment) => sum + assessment.incorrect,
        0,
      );
      const totalSkipped = assessment.reduce(
        (sum, assessment) => sum + assessment.skipped,
        0,
      );

      // Calculate total questions
      const totalQuestions = totalCorrect + totalIncorrect + totalSkipped;

      // Calculate overall accuracy
      const overallAccuracy =
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0; // Avoid division by zero
      const final = {
        totalAssessmentCount: totalAssessmentCount,
        completedAssessment: completedAssessment,
        countAccuracy:
          totalAssessmentCount > 0
            ? ((completedAssessment / totalAssessmentCount) * 100).toFixed(2)
            : 0,
        accuracy: overallAccuracy.toFixed(2),
      };
      return this.baseResponse.sendResponse(
        200,
        'Pro Assessment Result',
        final,
      );
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async proAssessmentReport(paginationDto: PaginationDto) {
    console.log(`This action returns pro assessment report`);
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const query = await this.filterService.filter(paginationDto);
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const totalRecords = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalRecords / limit);
      const assessments = await collection
        .find(query)
        .skip(Number(limit) * (Number(page) - 1))
        .limit(Number(limit))
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .toArray();
      const result = [];
      for (const records of assessments) {
        const processedAssessments = await Promise.all(
          records.assessments.map(async (assessment) => {
            if (assessment.pending === 'no') {
              const user = await this.subscriberModel
                .findById(records.user_id)
                .populate([
                  { path: 'cadreId', select: 'title' },
                  { path: 'stateId', select: 'title' },
                  { path: 'districtId', select: 'title' },
                  { path: 'countryId', select: 'title' },
                  { path: 'healthFacilityId', select: 'healthFacilityCode' },
                  { path: 'blockId', select: 'title' },
                ])
                .select(
                  'name email phoneNo cadreId stateId districtId blockId healthFacilityId countryId',
                );

              // Return the transformed assessment data
              return {
                name: user.name,
                cadreId: user.cadreId ? (user.cadreId as any).title : '',
                stateId: user.stateId ? (user.stateId as any).title : '',
                countryId: user.countryId ? (user.countryId as any).title : '',
                districtId: user.districtId
                  ? (user.districtId as any).title
                  : '',
                blockId: user.blockId ? (user.blockId as any).title : '',
                healthFacilityId: user.healthFacilityId
                  ? (user.healthFacilityId as any).healthFacilityCode
                  : '',
                assessmentId: assessment.assessment_id,
                totalMarks: assessment.questions.length,
                title: assessment.title,
                obtainedMarks: Math.round(
                  (assessment.correct / assessment.questions.length) * 100,
                ),
                attempted: assessment.correct + assessment.incorrect,
                rightAnswer: assessment.correct,
                wrongAnswer: assessment.incorrect,
                skipped: assessment.skipped,
                createdAt: records.created_at,
                updatedAt: records.updated_at,
              };
            }
            return null; // Return null for assessments that don't match the condition
          }),
        );
        // Filter out null results and add to the final result array
        result.push(...processedAssessments.filter(Boolean));
      }
      const paginatedResult = {
        list: result,
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalRecords,
      };
      return this.baseResponse.sendResponse(
        200,
        message.assessmentResponse.ASSESSMENT_RESPONSE_LIST,
        paginatedResult,
      );
    } catch (error) {
      console.error('Error performing Pro assessment Report:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}
