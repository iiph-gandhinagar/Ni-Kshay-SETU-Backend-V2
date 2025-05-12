import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { surveyAggregation } from 'src/common/pagination/surveyAggregation.service';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateSurveyHistoryDto } from './dto/create-survey-history.dto';
import { SurveyHistoryDocument } from './entities/survey-history.entity';

@Injectable()
export class SurveyHistoryService {
  constructor(
    @InjectModel('SurveyHistory')
    private readonly surveyHistoryModel: Model<SurveyHistoryDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
  ) {}

  async create(createSurveyHistoryDto: CreateSurveyHistoryDto, userId: string) {
    console.log('This action adds a new Survey History');
    createSurveyHistoryDto.surveyId = new mongoose.Types.ObjectId(
      createSurveyHistoryDto.surveyId,
    );
    createSurveyHistoryDto.userId = new mongoose.Types.ObjectId(userId);
    const newSurveyHistory = await this.surveyHistoryModel.create(
      createSurveyHistoryDto,
    );

    return this.baseResponse.sendResponse(
      200,
      message.surveyHistory.SURVEY_HISTORY_CREATED,
      newSurveyHistory,
    );
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log('This action returns all Survey History');
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

    return await surveyAggregation(
      this.surveyHistoryModel,
      paginationDto,
      query,
    );
  }

  async surveyHistoryCsv(paginationDto: PaginationDto) {
    console.log('This action returns all Survey History report');
    const query = await this.filterService.filter(paginationDto);
    const survey = [
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' }, // Convert userId array to an object
      { $match: query },
      {
        $lookup: {
          from: 'countries',
          localField: 'userId.countryId',
          foreignField: '_id',
          as: 'userId.country',
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'userId.stateId',
          foreignField: '_id',
          as: 'userId.state',
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'userId.cadreId',
          foreignField: '_id',
          as: 'userId.cadre',
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'userId.districtId',
          foreignField: '_id',
          as: 'userId.district',
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
      {
        $unwind: { path: '$questionAnswer', preserveNullAndEmptyArrays: true },
      },
      // Lookup to join with 'SurveyMaster' to fetch details for 'surveyQuestionId'
      {
        $lookup: {
          from: 'surveymasters', // Collection name for 'SurveyMaster'
          localField: 'questionAnswer.surveyQuestionId',
          foreignField: 'questions._id', // Match with question's _id in SurveyMaster
          as: 'surveyDetails',
        },
      },
      // Unwind 'surveyDetails' to process individual matches
      {
        $unwind: { path: '$surveyDetails', preserveNullAndEmptyArrays: true },
      },
      // Unwind 'surveyDetails.questions' to find the specific question
      {
        $unwind: {
          path: '$surveyDetails.questions',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Match to ensure only the relevant question is returned
      {
        $match: {
          $expr: {
            $eq: [
              '$questionAnswer.surveyQuestionId',
              '$surveyDetails.questions._id',
            ],
          },
        },
      },
      {
        $project: {
          userId: '$userId',
          _id: 1,
          'questionAnswer.answer': 1,
          'surveyDetails.surveyId': 1,
          'surveyDetails.title': 1,
          'surveyDetails.questions.title': 1, // The question title
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S', // Custom date format
              date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
              timezone: 'Asia/Kolkata', // Convert to IST (Indian Standard Time)
            },
          },
          userData: {
            name: 1,
            phoneNo: 1,
            email: 1,
            country: { $arrayElemAt: ['$userId.country.title', 0] },
            state: { $arrayElemAt: ['$userId.state.title', 0] },
            cadre: { $arrayElemAt: ['$userId.cadre.title', 0] },
            district: { $arrayElemAt: ['$userId.district.title', 0] },
            block: { $arrayElemAt: ['$userId.block.title', 0] },
          },
        },
      },
    ];
    const result = await this.surveyHistoryModel.aggregate(survey).exec();
    return this.baseResponse.sendResponse(
      200,
      message.surveyHistory.SURVEY_HISTORY_LIST,
      result,
    );
  }
}
