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
import { feedbackAggregation } from 'src/common/pagination/feedbackAggregation.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminService } from 'src/common/utils/adminService';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateFeedbackHistoryDto } from './dto/create-feedback-history.dto';
import { FeedbackHistoryDocument } from './entities/feedback-history.entity';

@Injectable()
export class FeedbackHistoryService {
  constructor(
    @InjectModel('FeedbackHistory')
    private readonly feedbackHistoryModel: Model<FeedbackHistoryDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
  ) {}
  async create(
    createFeedbackHistoryDto: CreateFeedbackHistoryDto,
    userId: string,
  ) {
    const { ratings, review } = createFeedbackHistoryDto;
    try {
      const subscriber = await this.subscriberModel
        .findById(userId)
        .select('_id')
        .exec();
      if (!subscriber) {
        throw new HttpException(
          {
            message: 'Subscriber Not Found',
            errors: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      for (const response of ratings) {
        const newRequest = {
          userId: new mongoose.Types.ObjectId(userId),
          feedbackId: new mongoose.Types.ObjectId(response.id),
          ratings: response.rating,
          review: review || null,
          skip: response.skip,
        };

        let skip = false;

        if (ratings.some((item) => item.skip === true)) {
          skip = true;
        }

        await this.subscriberModel.updateOne(
          { _id: subscriber._id },
          {
            $push: {
              'userContext.feedbackHistory': {
                feedbackId: new mongoose.Types.ObjectId(response.id),
                isCompleted: !skip,
                createdAt: new Date(),
              },
            },
          },
        );

        await this.feedbackHistoryModel.create(newRequest);
      }

      return this.baseResponse.sendResponse(
        200,
        'Thank You For Your Response',
        [],
      );
    } catch (error) {
      console.log(`❌ Error storing feedback: ${error.message}`);
      throw new HttpException(
        {
          message: 'feedback issue!',
          details: error.message, // Include actual error
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns all feedbackHistory ---`);
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      )
      .exec();
    if (!adminUser) {
      throw new HttpException(
        {
          message: 'Admin User not found',
          errors: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (adminUser.isAllState !== true) {
      paginationDto.adminStateId = adminUser.state.toString();
    }

    if (adminUser.isAllDistrict !== true) {
      paginationDto.adminDistrictId = adminUser.district.toString();
    }
    const query = await this.filterService.filter(paginationDto);

    return await feedbackAggregation(
      this.feedbackHistoryModel,
      paginationDto,
      query,
    );
  }

  async feedbackHistoryCsv(paginationDto: PaginationDto) {
    console.log('This action return feedback history report in csv');
    const query = await this.filterService.filter(paginationDto);
    const feedback = [
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
        $lookup: {
          from: 'feedbacks', // Collection name for 'feedbackMaster'
          localField: 'feedbackId',
          foreignField: '_id', // Match with question's _id in feedbackMaster
          as: 'feedback',
        },
      },
      { $match: query },
      {
        $project: {
          userId: '$userId',
          feedbackId: '$feedbacks',
          _id: 1,
          'feedback.question': 1,
          'feedback.description': 1,
          'feedback.active': 1,
          ratings: 1,
          review: 1,
          skip: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S', // Custom date format
              date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
              timezone: 'Asia/Kolkata', // Convert to IST (Indian Standard Time)
            },
          },
          updatedAt: 1,
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
    const result = await this.feedbackHistoryModel.aggregate(feedback).exec();
    return this.baseResponse.sendResponse(
      200,
      'Feedback Histories fetch successfully',
      result,
    );
  }
}
