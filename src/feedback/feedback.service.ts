import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FeedbackHistoryDocument } from 'src/feedback-history/entities/feedback-history.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackDocument } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel('Feedback')
    private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel('SubscriberProgressHistory')
    private readonly subscriberProgressModel: Model<SubscriberProgressHistoryDocument>,
    @InjectModel('FeedbackHistory')
    private readonly feedbackHistoryModel: Model<FeedbackHistoryDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<FeedbackDocument> {
    console.log('inside find by property App Config----->');
    return this.feedbackModel.findOne({ [property]: value }).exec();
  }
  async create(createFeedbackDto: CreateFeedbackDto) {
    console.log('This action adds a new App Config');
    const newFeedback = await this.feedbackModel.create(createFeedbackDto);
    return this.baseResponse.sendResponse(
      200,
      message.feedback.FEEDBACk_CREATED,
      newFeedback,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all App Config');
    const query = await this.filterService.filter(paginationDto);

    return await paginate(this.feedbackModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Ap Config`);
    const getAppConfigById = await this.feedbackModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.feedback.FEEDBACk_LIST,
      getAppConfigById,
    );
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    console.log(`This action updates a #${id} App Config`);
    const updateDetails = await this.feedbackModel.findByIdAndUpdate(
      id,
      updateFeedbackDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.feedback.FEEDBACk_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} App Config`);
    await this.feedbackModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.feedback.FEEDBACk_DELETE,
      [],
    );
  }

  async getFeedbackDetails(userId: string, feedbackQuestionSkip: boolean) {
    console.log(`This Action return related feedback questions`);
    //feedbackQuestionSkip == 0 --->menu feedback questions and feedbackQuestionSkip ==1 popup
    const feedbackQuestions = await this.feedbackModel.find({ active: true });
    console.log('feedback question-->', feedbackQuestions);
    if (!feedbackQuestions || feedbackQuestions.length === 0) {
      throw new Error('No active feedback questions found.');
    }
    const feedback = [];
    for (const record of feedbackQuestions) {
      const existRecord = await this.feedbackHistoryModel
        .find({
          userId: new mongoose.Types.ObjectId(userId),
          feedbackId: record._id,
        })
        .sort({ createdAt: -1 }) // ✅ Sorting will work with find()
        .limit(1) // ✅ Limit to one document
        .exec();
      const latestRecord = existRecord.length > 0 ? existRecord[0] : null;
      if (record.feedbackType == 'no_repeat') {
        if (latestRecord) {
          if (latestRecord && latestRecord.skip == true) {
            if (feedbackQuestionSkip == false) {
              feedback.push(record);
            } else {
              const createdAt = (record as any).createdAt;
              if (createdAt != new Date()) {
                feedback.push(record);
              }
            }
          }
        } else {
          feedback.push(record);
        }
      } else if (record.feedbackType == 'repeat') {
        if (latestRecord) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - record.feedbackDays);
          const createdAt = (record as any).createdAt;
          if (createdAt <= sevenDaysAgo) {
            feedback.push(record);
          } else if (createdAt >= sevenDaysAgo && latestRecord.skip == true) {
            if (!feedbackQuestionSkip) {
              feedback.push(record);
            } else {
              if (createdAt != new Date()) {
                feedback.push(record);
              }
            }
          }
        } else {
          feedback.push(record);
        }
      }
    }
    const activity = await this.subscriberProgressModel
      .findOne({
        userId: new mongoose.Types.ObjectId(userId),
      })
      .select('appOpenedCount chatbotUsageCount');

    console.log('activity', activity, feedback);
    let appCount = 0,
      chatbotCount = 0,
      moduleCount = 0,
      moduleTime = 0;
    for (const item of feedback) {
      // console.log('item --->', item);
      if (item.question.en == 'User Interface') {
        appCount = item.feedbackValue;
      } else if (item.question.en == 'Module Content') {
        moduleCount = item.feedbackValue;
        moduleTime = item.feedbackTime;
      } else if (item.question.en == 'Chatbot') {
        chatbotCount = item.feedbackValue;
      }
    }
    console.log(
      'appCount moduleCount chatbotCount',
      appCount,
      moduleCount,
      chatbotCount,
    );
    const result = await this.subscriberActivityModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Filter by subscriberId
          module: {
            $in: [
              'Diagnosis Algorithm',
              'NTEP Intervention',
              'TB Preventive Treatment',
              'Differentiated Care Of TB Patients',
              'Treatment Algorithm',
              'Guidance on ADR',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$module', // Group by the 'module' field
          totalAmount: { $sum: '$timeSpent' }, // Sum 'totalTime'
          // count: { $sum: 1 }, // Count the number of records per module
        },
      },
      {
        $match: {
          // This is not directly supported by MongoDB, but you can simulate it:
          $expr: {
            $gt: [{ $divide: ['$totalAmount', 60] }, Number(moduleTime)],
          }, // Convert totalAmount to minutes and compare to criteria
        },
      },
      {
        $sort: { totalAmount: -1 }, // Sort by 'totalAmount' descending
      },
      {
        $project: {
          _id: 0, // Don't include _id in output
          module: '$_id', // Rename _id to 'module'
          totalAmount: 1,
          // count: 1,
        },
      },
    ]);
    if (
      activity?.appOpenedCount >= appCount &&
      activity?.chatbotUsageCount >= chatbotCount &&
      result?.length >= moduleCount
    ) {
      return this.baseResponse.sendResponse(
        200,
        'Feedback Question List Fetched Successfully',
        feedback,
      );
    } else {
      return this.baseResponse.sendResponse(
        200,
        'Feedback Question List Fetched Successfully',
        [],
      );
    }
  }
}
