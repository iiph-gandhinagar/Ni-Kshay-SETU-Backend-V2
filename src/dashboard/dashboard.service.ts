import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Cache } from 'cache-manager';
import * as fs from 'fs';
import { MongoClient } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { join } from 'path';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { ChatConversionDocument } from 'src/chat-conversion/entities/chat-conversion.entity';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { OldAssessmentResultDocument } from 'src/old-assessment-result/entities/old-assessment-result.entity';
import { ProAssessmentResponseDocument } from 'src/pro-assessment-response/entities/pro-assessment-response.entity';
import { QueryDocument } from 'src/query/entities/query.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('ProAssessmentResponse')
    private readonly proAssessmentModel: Model<ProAssessmentResponseDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('subscriberProgressHistory')
    private SubscriberProgressHistoryModel: Model<SubscriberProgressHistoryDocument>,
    @InjectModel('ChatConversion')
    private chatConversionModel: Model<ChatConversionDocument>,
    @InjectModel('Query')
    private queryModel: Model<QueryDocument>,
    @InjectModel('OldAssessmentResult')
    private readonly oldAssessmentModel: Model<OldAssessmentResultDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  ) {}
  async getWebDashboardData() {
    const client = new MongoClient(process.env.MONGO_URL);
    const totalCompletedAssessment =
      await this.assessmentResponseModel.countDocuments();
    await client.connect();
    const db = client.db('ns-rewamp-backend');
    const collection = db.collection('userassessments');
    const userAssessments = await collection.find({}).toArray();

    // Count assessments with pending flag set to "no"
    const proCompletedAssessment = userAssessments.reduce((count, user) => {
      if (user.assessments && Array.isArray(user.assessments)) {
        const completed = user.assessments.filter(
          (assessment) => assessment.pending === 'no',
        );
        return count + completed.length;
      }
      return count;
    }, 0);
    const totalSubscriber = await this.subscriberModel.countDocuments();
    const totalVistor = await this.subscriberActivityModel.countDocuments();
    const cadreWiseSubscribers = await this.subscriberModel.aggregate([
      {
        $lookup: {
          from: 'cadres', // Name of the cadre collection
          localField: 'cadreId',
          foreignField: '_id',
          as: 'cadreDetails',
        },
      },
      {
        $unwind: '$cadreDetails',
      },
      {
        $group: {
          _id: '$cadreId',
          CadreName: { $first: '$cadreDetails.title' },
          TotalCadreCount: { $sum: 1 },
        },
      },
      {
        $sort: { TotalCadreCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'subscribers',
          // Replace with your collection name if different
          pipeline: [
            {
              $group: {
                _id: null,
                TotalCount: {
                  $sum: 1,
                },
              },
            },
          ],
          as: 'totalCount',
        },
      },
      {
        $unwind: '$totalCount',
      },
      {
        $project: {
          _id: 0,
          cadreId: '$_id',
          CadreName: 1,
          TotalCadreCount: 1,
          Percentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$TotalCadreCount', '$totalCount.TotalCount'],
                  },
                  100,
                ],
              },
              2, // Number of decimal places to round to
            ],
          },
        },
      },
    ]);
    const levelWiseSubscribers = await this.subscriberModel.aggregate([
      {
        $group: {
          _id: '$cadreType',
          TotalCadreCount: {
            $sum: 1,
          },
        },
      },
      {
        $match: {
          _id: {
            $ne: null,
          }, // Excludes documents where _id is null
        },
      },
      {
        $sort: {
          TotalCadreCount: -1,
        },
      },
      {
        $lookup: {
          from: 'subscribers',
          // Replace with your collection name if different
          pipeline: [
            {
              $group: {
                _id: null,
                TotalCount: {
                  $sum: 1,
                },
              },
            },
          ],
          as: 'totalCount',
        },
      },
      {
        $unwind: '$totalCount',
      },
      {
        $project: {
          _id: 1,
          TotalCadreCount: 1,
          Percentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$TotalCadreCount', '$totalCount.TotalCount'],
                  },
                  100,
                ],
              },
              2, // Number of decimal places to round to
            ],
          },
        },
      },
    ]);
    const moduleUsage = await this.subscriberActivityModel.aggregate([
      {
        $match: {
          module: {
            $in: [
              'Knowledge Connect',
              'Chatbot',
              'Diagnosis Algorithm',
              'Treatment Algorithm',
              'Guidance on ADR',
              'Differentiated Care',
              'TB Preventive Treatment',
              'Resource Material',
              'Screening tool',
              'Dynamic Algorithm',
              'ManageTB India',
              'Query2COE',
              'Referral Health Facility',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$module', // Replace with the field that uniquely identifies the subscriber
          ActivityCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          ActivityCount: -1,
        },
      },
      {
        $limit: 5, // Limit the output to the top 5 results
      },
      {
        $project: {
          _id: 0, // Exclude the original _id
          ModuleName: '$_id', // Rename _id to ModuleName
          ActivityCount: 1,
        },
      },
    ]);
    const stateWiseCount = await this.subscriberModel.aggregate([
      {
        $lookup: {
          from: 'states', // The name of the state collection
          localField: 'stateId', // The field in the subscriber collection
          foreignField: '_id', // The field in the state collection
          as: 'stateDetails', // The name of the array field to store matched documents
        },
      },
      {
        $unwind: '$stateDetails', // Flatten the array to access the state details
      },
      {
        $group: {
          _id: '$stateDetails.title', // Group by the state name
          StateName: { $first: '$stateDetails.title' }, // Get the state name
          state_id: { $first: '$stateDetails.id' }, // Get the state name
          TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
        },
      },
      {
        $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          StateName: 1, // Include state name in the output
          state_id: 1,
          TotalSubscriberCount: 1, // Include the total count in the output
        },
      },
    ]);
    const result = {
      totalAssessment: totalCompletedAssessment + proCompletedAssessment,
      totalActivities: totalVistor,
      totalSubscriber: totalSubscriber,
      cadreWiseSubscribers: cadreWiseSubscribers,
      levelWiseSubscribers: levelWiseSubscribers,
      moduleUsage: moduleUsage,
      stateWiseCount: stateWiseCount,
    };
    return this.baseResponse.sendResponse(200, 'Dashboard data', result);
  }

  async buildQuery(query) {
    const filter: Record<string, any> = {};
    // console.log('stateId --->', query.state);
    if (query.state) {
      filter['stateId'] = new mongoose.Types.ObjectId(query.state);
    }
    if (query.district) {
      filter['districtId'] = new mongoose.Types.ObjectId(query.district);
    }
    if (query.blocks) {
      filter['blockId'] = new mongoose.Types.ObjectId(query.blocks);
    }
    if (query.fromDate || query.toDate) {
      filter['createdAt'] = {};
      if (query.fromDate) {
        filter['createdAt']['$gte'] = new Date(query.fromDate);
      }
      if (query.toDate) {
        const endDate = new Date(query.toDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        filter['createdAt']['$lte'] = endDate;
      }
    }
    return filter;
  }

  async buildQueryByUserId(query) {
    const filter: Record<string, any> = {};

    if (query.state) {
      filter['user.stateId'] = new mongoose.Types.ObjectId(query.state);
    }
    if (query.district) {
      filter['user.districtId'] = new mongoose.Types.ObjectId(query.district);
    }
    if (query.blocks) {
      filter['user.blockId'] = new mongoose.Types.ObjectId(query.blocks);
    }
    if (query.fromDate || query.toDate) {
      filter['createdAt'] = {};
      if (query.fromDate) {
        filter['createdAt']['$gte'] = new Date(query.fromDate);
      }
      if (query.toDate) {
        const endDate = new Date(query.toDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        filter['createdAt']['$lte'] = endDate;
      }
    }
    return filter;
  }

  async subscriberCounts(paginationDto) {
    const query = await this.buildQuery(paginationDto);
    const { type } = paginationDto;
    let result;
    if (type == 'today') {
      const todaysSubscriberCount = await this.subscriberModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
        },
      });
      const todaysSubscriber = await this.subscriberModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
            },
          },
        },
        {
          $project: {
            hour: {
              $dateToString: {
                format: '%H', // Extract the hour in 24-hour format
                date: '$createdAt',
                timezone: 'Asia/Kolkata', // Specify the timezone as IST (India)
              },
            }, // Extract the hour from createdAt
          },
        },
        {
          $group: {
            _id: '$hour', // Group by the extracted hour
            count: { $sum: 1 }, // Count the number of documents in each group
          },
        },
        {
          $sort: { _id: 1 }, // Sort the results by hour (ascending order)
        },
      ]);
      result = {
        todaysSubscriberCount: todaysSubscriberCount,
        todaysSubscriber: todaysSubscriber,
      };
    } else {
      const totalSubscriberCount =
        await this.subscriberModel.countDocuments(query);

      const totalSubscriber = await this.subscriberModel.aggregate([
        {
          $match: query,
        },
        {
          $addFields: {
            formattedDate: {
              $dateToString: {
                format: query.createdAt ? '%Y-%m-%d' : '%Y-%m', // Adjust format dynamically
                date: '$createdAt',
              },
            },
          },
        },
        {
          // Stage 2: Group by year and month
          $group: {
            _id: '$formattedDate', // Group by yearMonth
            count: { $sum: 1 }, // Count documents
          },
        },
        {
          // Stage 3: Sort by yearMonth in ascending order
          $sort: { _id: 1 },
        },
      ]);

      result = {
        totalSubscriberCount: totalSubscriberCount,
        totalSubscriber: totalSubscriber,
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'Subscriber Counts Fetched Successfully!!',
      result,
    );
  }

  async visitorCount(paginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    console.log('query -->', query);
    const { type } = paginationDto;
    let cacheKey;
    if (query) {
      cacheKey = `visitors:${query}:${type}:${JSON.stringify(query)}`;
    } else {
      cacheKey = `visitors:${type}:${JSON.stringify(query)}`;
    }

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      console.log('Returning cached data for', cacheKey);
      return this.baseResponse.sendResponse(
        200,
        'Visitor Counts Fetched Successfully!!',
        cachedData,
      ); // Return cached result
    }
    let result;
    let totalVisitorCount, totalVisitor, visitor;
    if (type == 'today') {
      const [todaysVisitorCountResult, todaysVisitor] = await Promise.all([
        this.subscriberActivityModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
              action: 'user_home_page_visit',
            },
          },
          {
            $count: 'uniqueUsers',
          },
        ]),
        this.subscriberActivityModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
              action: 'user_home_page_visit',
            },
          },
          {
            $project: {
              hour: {
                $dateToString: {
                  format: '%H',
                  date: '$createdAt',
                  timezone: 'Asia/Kolkata',
                },
              },
              userId: 1,
            },
          },
          {
            $group: {
              _id: { hour: '$hour' },
            },
          },
          {
            $group: {
              _id: '$_id.hour',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]),
      ]);

      // Extract the results safely
      result = {
        todaysVisitorCount: todaysVisitorCountResult?.[0]?.uniqueUsers || 0,
        todaysVisitor: todaysVisitor,
      };
    } else {
      if (query && Object.keys(query).length > 0) {
        [visitor, totalVisitor] = await Promise.all([
          this.subscriberActivityModel.aggregate([
            {
              $match: {
                userId: { $exists: true, $ne: null },
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
            {
              $match: query,
            },
            { $count: 'totalCount' },
          ]),
          this.subscriberActivityModel.aggregate([
            {
              $lookup: {
                from: 'subscribers',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $match: query,
            },
            {
              $addFields: {
                formattedDate: {
                  $dateToString: {
                    format: query.createdAt ? '%Y-%m-%d' : '%Y-%m',
                    date: '$createdAt',
                  },
                },
              },
            },
            {
              $group: {
                _id: '$formattedDate',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]),
        ]);
        // console.log('visitor-->', visitor, totalVisitor);
        // Safely extract visitor count
        totalVisitorCount = visitor?.[0]?.totalCount || 0;
      } else {
        [totalVisitorCount, totalVisitor] = await Promise.all([
          this.subscriberActivityModel.countDocuments(),
          this.subscriberActivityModel.aggregate([
            {
              $addFields: {
                yearMonth: {
                  $dateToString: { format: '%Y-%m', date: '$createdAt' },
                },
              },
            },
            {
              $group: {
                _id: '$yearMonth',
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
        ]);
      }

      result = {
        totalVisitorCount: totalVisitorCount,
        totalVisitor: totalVisitor,
      };
    }
    await this.cacheManager.set(cacheKey, result, 30 * 60 * 1000);
    const cachedData1 = await this.cacheManager.get(cacheKey);
    console.log('cachedData', cachedData1);

    /* This Will give group by user and visit user_home_page_visit activity */

    return this.baseResponse.sendResponse(
      200,
      'Visitor Counts Fetched Successfully!!',
      result,
    );
  }

  async assessmentCount(paginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    const { type } = paginationDto;
    let totalCompletedAssessment,
      totalAssessment,
      result,
      totalProCompletedAssessment,
      totalProAssessment,
      finalResults,
      totalOldAssessment,
      totalOldAssessments; //userAssessments,

    if (type == 'today') {
      const todaysCompletedAssessment =
        await this.assessmentResponseModel.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
            $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
          },
        });
      const proAssessment = await this.proAssessmentModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
        },
      });
      const todaysAssessment = await this.assessmentResponseModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
            },
            isCalculated: true,
          },
        },
        {
          $project: {
            hour: {
              $dateToString: {
                format: '%H', // Extract the hour in 24-hour format
                date: '$createdAt',
                timezone: 'Asia/Kolkata', // Specify the timezone as IST (India)
              },
            }, // Extract the hour from createdAt
          },
        },
        {
          $group: {
            _id: '$hour', // Group by the extracted hour
            count: { $sum: 1 }, // Count the number of documents in each group
          },
        },
        {
          $sort: { _id: 1 }, // Sort the results by hour (ascending order)
        },
      ]);
      const todaysProCompletedAssessment =
        await this.proAssessmentModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
                $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
              },
            },
          },
          {
            $project: {
              hour: {
                $dateToString: {
                  format: '%H', // Extract the hour in 24-hour format
                  date: '$createdAt',
                  timezone: 'Asia/Kolkata', // Specify the timezone as IST (India)
                },
              }, // Extract the hour from createdAt
            },
          },
          {
            $group: {
              _id: '$hour', // Group by the extracted hour
              count: { $sum: 1 }, // Count the number of documents in each group
            },
          },
          {
            $sort: { _id: 1 }, // Sort the results by hour (ascending order)
          },
        ]);

      const mergedResults: Record<string, { _id: string; count: number }> = {};

      // Process `todaysAssessment`
      todaysAssessment.forEach(({ _id, count }) => {
        mergedResults[_id] = { _id, count };
      });

      // Process `todaysProCompletedAssessment`
      todaysProCompletedAssessment.forEach(({ _id, count }) => {
        if (mergedResults[_id]) {
          mergedResults[_id].count += count; // Add count if hour exists
        } else {
          mergedResults[_id] = { _id, count: count };
        }
      });

      // Convert the merged object back to an array and sort by hour
      const finalResults = Object.values(mergedResults).sort(
        (a, b) => Number(a._id) - Number(b._id),
      );
      result = {
        todaysCompletedAssessment: todaysCompletedAssessment + proAssessment,
        todaysAssessment: finalResults,
      };
    } else {
      console.log('query-->', query);
      if (query && Object.keys(query).length > 0) {
        const assessment = await this.assessmentResponseModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $count: 'totalCount', // Count the matching documents
          },
        ]);
        totalCompletedAssessment = assessment?.[0]?.totalCount | 0;
        const ProAssessment = await this.proAssessmentModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $count: 'totalCount', // Count the matching documents
          },
        ]);
        totalProCompletedAssessment = ProAssessment?.[0]?.totalCount | 0;

        const oldAssessment = await this.oldAssessmentModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $count: 'totalCount', // Count the matching documents
          },
        ]);
        totalOldAssessment = oldAssessment?.[0]?.totalCount | 0;
        totalAssessment = await this.assessmentResponseModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $addFields: {
              formattedDate: {
                $dateToString: {
                  format: query.createdAt ? '%Y-%m-%d' : '%Y-%m', // Adjust format dynamically
                  date: '$createdAt',
                },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$formattedDate', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);
        totalProAssessment = await this.proAssessmentModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $addFields: {
              formattedDate: {
                $dateToString: {
                  format: query.createdAt ? '%Y-%m-%d' : '%Y-%m', // Adjust format dynamically
                  date: '$createdAt',
                },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$formattedDate', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);
        totalOldAssessments = await this.oldAssessmentModel.aggregate([
          {
            $lookup: {
              from: 'subscribers', // Name of the referenced collection
              localField: 'userId', // Field in `assessmentResponseModel`
              foreignField: '_id', // Field in `users`
              as: 'user', // Name for the joined data
            },
          },
          {
            $unwind: '$user', // Flatten the `users` array
          },
          {
            $match: query, // Apply the filter
          },
          {
            $addFields: {
              formattedDate: {
                $dateToString: {
                  format: query.createdAt ? '%Y-%m-%d' : '%Y-%m', // Adjust format dynamically
                  date: '$createdAt',
                },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$formattedDate', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);
        const mergedResults: Record<string, { _id: string; count: number }> =
          {};

        // Process `todaysAssessment`
        totalAssessment.forEach(({ _id, count }) => {
          mergedResults[_id] = { _id, count };
        });

        // Process `todaysProCompletedAssessment`
        totalProAssessment.forEach(({ _id, count }) => {
          if (mergedResults[_id]) {
            mergedResults[_id].count += count; // Add count if hour exists
          } else {
            mergedResults[_id] = { _id, count };
          }
        });

        totalOldAssessments.forEach(({ _id, count }) => {
          if (mergedResults[_id]) {
            mergedResults[_id].count += count; // Add count if hour exists
          } else {
            mergedResults[_id] = { _id, count };
          }
        });

        // Convert the merged object back to an array and sort by hour
        finalResults = Object.values(mergedResults).sort(
          (a, b) => Number(a._id) - Number(b._id),
        );
      } else {
        totalCompletedAssessment =
          await this.assessmentResponseModel.countDocuments();
        totalProCompletedAssessment =
          await this.proAssessmentModel.countDocuments();
        totalOldAssessment = await this.oldAssessmentModel.countDocuments();
        totalAssessment = await this.assessmentResponseModel.aggregate([
          {
            // Stage 1: Extract year and month from createdAt
            $addFields: {
              yearMonth: {
                $dateToString: { format: '%Y-%m', date: '$createdAt' },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$yearMonth', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);

        totalProAssessment = await this.proAssessmentModel.aggregate([
          {
            // Stage 1: Extract year and month from createdAt
            $addFields: {
              yearMonth: {
                $dateToString: { format: '%Y-%m', date: '$createdAt' },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$yearMonth', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);

        totalOldAssessments = await this.oldAssessmentModel.aggregate([
          {
            // Stage 1: Extract year and month from createdAt
            $addFields: {
              yearMonth: {
                $dateToString: { format: '%Y-%m', date: '$createdAt' },
              },
            },
          },
          {
            // Stage 2: Group by year and month
            $group: {
              _id: '$yearMonth', // Group by yearMonth
              count: { $sum: 1 }, // Count documents
            },
          },
          {
            // Stage 3: Sort by yearMonth in ascending order
            $sort: { _id: 1 },
          },
        ]);

        const mergedResults: Record<string, { _id: string; count: number }> =
          {};

        // Process `todaysAssessment`
        totalAssessment.forEach(({ _id, count }) => {
          if (!mergedResults[_id]) {
            mergedResults[_id] = { _id, count };
          } else {
            mergedResults[_id].count += count;
          }
        });

        // Process `totalProAssessment`
        totalProAssessment.forEach(({ _id, count }) => {
          if (!mergedResults[_id]) {
            mergedResults[_id] = { _id, count };
          } else {
            mergedResults[_id].count += count; // Add count if _id exists
          }
        });

        // Process `totalOldAssessments`
        totalOldAssessments.forEach(({ _id, count }) => {
          if (!mergedResults[_id]) {
            mergedResults[_id] = { _id, count };
          } else {
            mergedResults[_id].count += count;
          }
        });

        // Convert the merged object back to an array and sort by _id
        finalResults = Object.values(mergedResults).sort(
          (a, b) => Number(a._id) - Number(b._id),
        );
      }
      result = {
        totalCompletedAssessment:
          totalCompletedAssessment +
          totalProCompletedAssessment +
          totalOldAssessment,
        totalAssessment: finalResults,
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'Assessment Graph Fetched Successfully!!',
      result,
    );
  }

  async totalMinuteSpent(paginationDto) {
    console.log('inside total minute spent function');
    let minuteSpentCount = 0;
    if (paginationDto.fromDate || paginationDto.toDate) {
      const givenYear = new Date(paginationDto.fromDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (givenYear !== currentYear) {
        minuteSpentCount = 272814;
      }
    }
    const query = await this.buildQueryByUserId(paginationDto);
    console.log('query -->', query);
    const { type } = paginationDto;
    let totalMinuteSpent, result;
    if (type == 'today') {
      const todaysMinuteSpent = await this.subscriberActivityModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lt: new Date().setHours(23, 59, 59, 999),
            },
            module: 'overall_app_usage',
          },
        },
        {
          $group: { _id: null, totalTimeSpent: { $sum: '$timeSpent' } },
        },
        {
          $project: {
            points: { $round: [{ $divide: ['$totalTimeSpent', 60] }, 2] },
          },
        },
      ]);

      result = {
        todaysMinuteSpent: todaysMinuteSpent[0],
      };
    } else {
      if (query && Object.keys(query).length > 0) {
        const totalMinuteSpentResult = await Promise.all([
          this.subscriberActivityModel.aggregate([
            { $match: { module: 'overall_app_usage' } },
            {
              $lookup: {
                from: 'subscribers',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            { $match: query },
            {
              $group: {
                _id: null,
                totalMinutes: { $sum: '$timeSpent' },
              },
            },
            {
              $project: {
                points: {
                  $round: [
                    {
                      $add: [
                        { $divide: ['$totalMinutes', 60] },
                        minuteSpentCount,
                      ],
                    },
                    2,
                  ],
                },
              },
            },
          ]),
        ]);

        totalMinuteSpent = totalMinuteSpentResult[0];
      } else {
        const totalMinuteSpentResult = await Promise.all([
          this.subscriberActivityModel.aggregate([
            { $match: { module: 'overall_app_usage' } },
            {
              $group: {
                _id: null,
                totalMinutes: { $sum: '$timeSpent' },
              },
            },
            {
              $project: {
                points: {
                  $round: [
                    { $add: [{ $divide: ['$totalMinutes', 60] }, 272814] },
                    2,
                  ],
                },
              },
            },
          ]),
        ]);

        totalMinuteSpent = totalMinuteSpentResult[0];
      }
      result = {
        totalMinuteSpent: totalMinuteSpent, // static old counts
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'General Counts Fetched Successfully!!',
      result,
    );
  }

  async screeningToolCount(paginationDto) {
    console.log('inside Screening Tool function');
    let screeningCount = 0;
    if (paginationDto.fromDate || paginationDto.toDate) {
      const givenYear = new Date(paginationDto.fromDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (givenYear !== currentYear) {
        screeningCount = 12065;
      }
    }
    const query = await this.buildQueryByUserId(paginationDto);
    console.log('query -->', query);
    const { type } = paginationDto;
    let screeningTool, result;
    if (type == 'today') {
      const todaysScreeningTool =
        await this.subscriberActivityModel.countDocuments({
          module: /Screening tool/i,
          createdAt: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        });

      result = {
        todaysScreeningTool: todaysScreeningTool,
      };
    } else {
      if (query && Object.keys(query).length > 0) {
        const screeningToolResult =
          await this.subscriberActivityModel.aggregate([
            {
              $lookup: {
                from: 'subscribers',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            { $match: { module: /Screening tool/i, ...query } },
            { $count: 'totalCount' },
          ]);

        screeningTool =
          (screeningToolResult?.[0]?.totalCount || 0) + screeningCount;
      } else {
        const screeningToolCount =
          await this.subscriberActivityModel.countDocuments({
            module: /Screening tool/i,
          });

        screeningTool = screeningToolCount + 12065;
      }
      result = {
        screeningTool: screeningTool, // static old counts
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'General Counts Fetched Successfully!!',
      result,
    );
  }

  async chatbotCount(paginationDto) {
    console.log('inside Screening Tool function');
    let chatbotCount = 0;
    if (paginationDto.fromDate || paginationDto.toDate) {
      const givenYear = new Date(paginationDto.fromDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (givenYear !== currentYear) {
        chatbotCount = 17214;
      }
    }
    const query = await this.buildQueryByUserId(paginationDto);
    // console.log('query -->', query);
    const { type } = paginationDto;
    let chatbotUsage, result;
    if (type == 'today') {
      const todaysChatbotUsage =
        await this.subscriberActivityModel.countDocuments({
          module: /Chatbot/i,
          createdAt: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        });
      result = {
        todaysChatbotUsage: todaysChatbotUsage,
      };
    } else {
      if (query && Object.keys(query).length > 0) {
        const chatbotResult = await this.subscriberActivityModel.aggregate([
          {
            $lookup: {
              from: 'subscribers',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          { $match: { module: /Chatbot/i, ...query } },
          { $count: 'totalCount' },
        ]);

        chatbotUsage = (chatbotResult?.[0]?.totalCount || 0) + chatbotCount;
      } else {
        const chatbotCountResult =
          await this.subscriberActivityModel.countDocuments({
            module: /Chatbot/i,
          });

        chatbotUsage = chatbotCountResult + 17214;
      }
      result = {
        chatbotUsage: chatbotUsage, // static old counts
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'General Counts Fetched Successfully!!',
      result,
    );
  }

  async generalCount(paginationDto) {
    let minuteSpentCount = 0,
      screeningCount = 0,
      chatbotCount = 0;
    if (paginationDto.fromDate || paginationDto.toDate) {
      const givenYear = new Date(paginationDto.fromDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (givenYear !== currentYear) {
        minuteSpentCount = 272814;
        chatbotCount = 17214;
        screeningCount = 12065;
      }
    }
    const query = await this.buildQueryByUserId(paginationDto);
    console.log('query -->', query);
    let totalMinuteSpent, chatbotUsage, screeningTool, result;
    const { type } = paginationDto;
    if (type == 'today') {
      const [todaysMinuteSpent, todaysScreeningTool, todaysChatbotUsage] =
        await Promise.all([
          this.subscriberActivityModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date().setHours(0, 0, 0, 0),
                  $lt: new Date().setHours(23, 59, 59, 999),
                },
                module: 'overall_app_usage',
              },
            },
            {
              $group: { _id: null, totalTimeSpent: { $sum: '$timeSpent' } },
            },
            {
              $project: {
                points: { $round: [{ $divide: ['$totalTimeSpent', 60] }, 2] },
              },
            },
          ]),
          this.subscriberActivityModel.countDocuments({
            module: /Screening tool/i,
            createdAt: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lt: new Date().setHours(23, 59, 59, 999),
            },
          }),
          this.subscriberActivityModel.countDocuments({
            module: /Chatbot/i,
            createdAt: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lt: new Date().setHours(23, 59, 59, 999),
            },
          }),
        ]);

      // console.log('totalMinuteSpent --->', totalMinuteSpent);
      result = {
        todaysMinuteSpent: todaysMinuteSpent,
        todaysChatbotUsage: todaysChatbotUsage,
        todaysScreeningTool: todaysScreeningTool,
      };
    } else {
      if (query && Object.keys(query).length > 0) {
        const [totalMinuteSpentResult, screeningToolResult, chatbotResult] =
          await Promise.all([
            this.subscriberActivityModel.aggregate([
              { $match: { module: 'overall_app_usage' } },
              {
                $lookup: {
                  from: 'subscribers',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              { $match: query },
              {
                $group: {
                  _id: null,
                  totalMinutes: { $sum: '$timeSpent' },
                },
              },
              {
                $project: {
                  points: {
                    $round: [
                      {
                        $add: [
                          { $divide: ['$totalMinutes', 60] },
                          minuteSpentCount,
                        ],
                      },
                      2,
                    ],
                  },
                },
              },
            ]),
            this.subscriberActivityModel.aggregate([
              {
                $lookup: {
                  from: 'subscribers',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              { $match: { module: /Screening tool/i, ...query } },
              { $count: 'totalCount' },
            ]),
            this.subscriberActivityModel.aggregate([
              {
                $lookup: {
                  from: 'subscribers',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              { $match: { module: /Chatbot/i, ...query } },
              { $count: 'totalCount' },
            ]),
          ]);

        totalMinuteSpent = totalMinuteSpentResult;
        screeningTool =
          (screeningToolResult?.[0]?.totalCount || 0) + screeningCount;
        chatbotUsage = (chatbotResult?.[0]?.totalCount || 0) + chatbotCount;
      } else {
        const [totalMinuteSpentResult, screeningToolCount, chatbotCountResult] =
          await Promise.all([
            this.subscriberActivityModel.aggregate([
              { $match: { module: 'overall_app_usage' } },
              {
                $group: {
                  _id: null,
                  totalMinutes: { $sum: '$timeSpent' },
                },
              },
              {
                $project: {
                  points: {
                    $round: [
                      { $add: [{ $divide: ['$totalMinutes', 60] }, 272814] },
                      2,
                    ],
                  },
                },
              },
            ]),
            this.subscriberActivityModel.countDocuments({
              module: /Screening tool/i,
            }),
            this.subscriberActivityModel.countDocuments({ module: /Chatbot/i }),
          ]);

        totalMinuteSpent = totalMinuteSpentResult;
        screeningTool = screeningToolCount + 12065;
        chatbotUsage = chatbotCountResult + 17214;
      }
      // console.log('totalMinuteSpent', totalMinuteSpent);
      result = {
        totalMinuteSpent: totalMinuteSpent, // static old counts
        chatbotUsage: chatbotUsage, // static old counts
        screeningTool: screeningTool, // static old admin panel counts
      };
    }

    return this.baseResponse.sendResponse(
      200,
      'General Counts Fetched Successfully!!',
      result,
    );
  }

  async mapCount(paginationDto: PaginationDto) {
    const query = await this.buildQuery(paginationDto);
    let stateWiseCount,
      todaysSubscriberCount,
      internationalLevelSubscriber,
      nationalLevelSubscriber;
    const totalSubscriberCount = await this.subscriberModel.countDocuments();

    // Step 2: Fetch today's subscriber count
    const todayDate = new Date().toISOString().split('T')[0];
    if (
      query &&
      query.createdAt &&
      !query.stateId &&
      !query.districtId &&
      !query.blockId
    ) {
      /* Total Subscriber count and this api count is not matched bcz some users don't verified */
      // console.log('query inside createdAt date--->', query);
      stateWiseCount = await this.subscriberModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'states', // The name of the state collection
            localField: 'stateId', // The field in the subscriber collection
            foreignField: '_id', // The field in the state collection
            as: 'stateDetails', // The name of the array field to store matched documents
          },
        },
        {
          $unwind: '$stateDetails', // Flatten the array to access the state details
        },
        {
          $group: {
            _id: {
              state: '$stateDetails.title',
              stateId: '$stateId',
            }, // Group by the state name
            StateName: { $first: '$stateDetails.title' },
            stateId: { $first: '$stateId' },
            TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
          },
        },
        {
          $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            StateName: 1,
            stateId: 1,
            TotalSubscriberCount: 1,
          },
        },
      ]);
      nationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'National_Level',
      });
      internationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'International_Level',
      });
    } else if (query && query.blockId) {
      stateWiseCount = await this.subscriberModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'healthfacilities', // The name of the state collection
            localField: 'healthFacilityId', // The field in the subscriber collection
            foreignField: '_id', // The field in the state collection
            as: 'healthFacilityDetails', // The name of the array field to store matched documents
          },
        },
        {
          $unwind: '$healthFacilityDetails', // Flatten the array to access the state details
        },
        {
          $group: {
            _id: {
              healthFacility: '$healthFacilityDetails.healthFacilityCode',
              healthFacilityId: '$healthFacilityId',
            }, // Group by the state name
            HealthFacilityName: {
              $first: '$healthFacilityDetails.healthFacilityCode',
            },
            healthFacilityId: { $first: '$healthFacilityId' },
            TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
          },
        },
        {
          $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            HealthFacilityName: 1,
            healthFacilityId: 1,
            TotalSubscriberCount: 1,
          },
        },
      ]);
      nationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        stateId: new mongoose.Types.ObjectId(query.stateId),
        districtId: new mongoose.Types.ObjectId(query.districtId),
        blockId: new mongoose.Types.ObjectId(query.blockId),
        $or: [
          { healthFacilityId: null }, // healthFacilityId is explicitly null
          { healthFacilityId: '' }, // healthFacilityId is an empty string
          { healthFacilityId: { $exists: false } }, // healthFacilityIdId does not exist
        ],
      });
      internationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'International_Level',
      });
    } else if (query && query.districtId) {
      stateWiseCount = await this.subscriberModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'blocks', // The name of the state collection
            localField: 'blockId', // The field in the subscriber collection
            foreignField: '_id', // The field in the state collection
            as: 'blockDetails', // The name of the array field to store matched documents
          },
        },
        {
          $unwind: '$blockDetails', // Flatten the array to access the state details
        },
        {
          $group: {
            _id: {
              block: '$blockDetails.title',
              blockId: '$blockId',
            }, // Group by the state name
            BlockName: { $first: '$blockDetails.title' },
            blockId: { $first: '$blockId' },
            TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
          },
        },
        {
          $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            BlockName: 1,
            blockId: 1,
            TotalSubscriberCount: 1,
          },
        },
      ]);
      nationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        stateId: new mongoose.Types.ObjectId(query.stateId),
        districtId: new mongoose.Types.ObjectId(query.districtId),
        $or: [
          { blockId: null }, // blockId is explicitly null
          { blockId: '' }, // blockId is an empty string
          { blockId: { $exists: false } }, // blockIdI does not exist
        ],
      });
      internationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'International_Level',
      });
    } else if (query && query.stateId) {
      stateWiseCount = await this.subscriberModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'districts', // The name of the state collection
            localField: 'districtId', // The field in the subscriber collection
            foreignField: '_id', // The field in the state collection
            as: 'districtDetails', // The name of the array field to store matched documents
          },
        },
        {
          $unwind: '$districtDetails', // Flatten the array to access the state details
        },
        {
          $group: {
            _id: {
              district: '$districtDetails.title',
              districtId: '$districtId',
            }, // Group by the state name
            DistrictName: { $first: '$districtDetails.title' },
            districtId: { $first: '$districtId' },
            TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
          },
        },
        {
          $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            DistrictName: 1,
            districtId: 1,
            TotalSubscriberCount: 1,
          },
        },
      ]);
      nationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        stateId: new mongoose.Types.ObjectId(query.stateId),
        $or: [
          { districtId: null }, // districtId is explicitly null
          { districtId: '' }, // districtId is an empty string
          { districtId: { $exists: false } }, // districtId does not exist
        ],
      });
      internationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'International_Level',
      });
    } else {
      stateWiseCount = await this.subscriberModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'states', // The name of the state collection
            localField: 'stateId', // The field in the subscriber collection
            foreignField: '_id', // The field in the state collection
            as: 'stateDetails', // The name of the array field to store matched documents
          },
        },
        {
          $unwind: '$stateDetails', // Flatten the array to access the state details
        },
        {
          $group: {
            _id: {
              state: '$stateDetails.title',
              stateId: '$stateId',
            }, // Group by the state name
            StateName: { $first: '$stateDetails.title' },
            stateId: { $first: '$stateId' },
            TotalSubscriberCount: { $sum: 1 }, // Count the number of subscribers for each state
          },
        },
        {
          $sort: { TotalSubscriberCount: -1 }, // Sort by the count in descending order
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            StateName: 1,
            stateId: 1,
            TotalSubscriberCount: 1,
          },
        },
      ]);
      nationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'National_Level',
      });
      internationalLevelSubscriber = await this.subscriberModel.countDocuments({
        ...query,
        cadreType: 'International_Level',
      });
    }
    const updatedStateWiseCount = await Promise.all(
      stateWiseCount.map(async (state) => {
        if (query && query.blockId) {
          todaysSubscriberCount = await this.subscriberModel.countDocuments({
            healthFacilityId: state.healthFacilityId,
            createdAt: {
              $gte: new Date(`${todayDate}T00:00:00Z`),
              $lt: new Date(`${todayDate}T23:59:59Z`),
            },
          });
        } else if (query && query.districtId) {
          todaysSubscriberCount = await this.subscriberModel.countDocuments({
            blockId: state.blockId,
            createdAt: {
              $gte: new Date(`${todayDate}T00:00:00Z`),
              $lt: new Date(`${todayDate}T23:59:59Z`),
            },
          });
        } else if (query && query.stateId) {
          todaysSubscriberCount = await this.subscriberModel.countDocuments({
            districtId: state.districtId,
            createdAt: {
              $gte: new Date(`${todayDate}T00:00:00Z`),
              $lt: new Date(`${todayDate}T23:59:59Z`),
            },
          });
        } else {
          todaysSubscriberCount = await this.subscriberModel.countDocuments({
            stateId: new mongoose.Types.ObjectId(state.stateId),
            createdAt: {
              $gte: new Date(`${todayDate}T00:00:00Z`),
              $lt: new Date(`${todayDate}T23:59:59Z`),
            },
          });
        }
        return {
          ...state,
          TodaysSubscriber: todaysSubscriberCount,
          Percentage: totalSubscriberCount
            ? Math.round(
                ((state.TotalSubscriberCount * 100) / totalSubscriberCount) *
                  100,
              ) / 100
            : 0,
        };
      }),
    );
    const result = {
      stateWiseCount: updatedStateWiseCount,
      internationalLevelSubscriber: internationalLevelSubscriber,
      nationalLevelSubscriber: nationalLevelSubscriber,
    };
    return this.baseResponse.sendResponse(
      200,
      'Map Count Fetched Successfully!!',
      result,
    );
  }
  async round(value: number, decimals: number) {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  }

  async cadreWiseGraph(paginationDto: PaginationDto) {
    const query = await this.buildQuery(paginationDto);

    const matchStage: any = { ...query };

    if (paginationDto.type === 'days') {
      matchStage['createdAt'] = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        $lt: new Date(),
      };
    }

    const result = await this.subscriberModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'cadres',
          localField: 'cadreId',
          foreignField: '_id',
          as: 'cadreDetails',
        },
      },
      { $unwind: '$cadreDetails' },
      {
        $group: {
          _id: '$cadreId',
          CadreName: { $first: '$cadreDetails.title' },
          CadreType: { $first: '$cadreDetails.cadreType' },
          TotalCadreCount: { $sum: 1 },
        },
      },
      { $sort: { TotalCadreCount: -1 } },
      { $limit: 5 },
      {
        $group: {
          _id: null,
          totalTopFiveCadres: { $sum: '$TotalCadreCount' }, // Sum only the top 5
          topCadres: { $push: '$$ROOT' }, // Store top 5
        },
      },
      { $unwind: '$topCadres' },
      {
        $project: {
          _id: 0,
          cadreId: '$topCadres._id',
          CadreName: '$topCadres.CadreName',
          CadreType: '$topCadres.CadreType',
          TotalCadreCount: '$topCadres.TotalCadreCount',
          Percentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      '$topCadres.TotalCadreCount',
                      '$totalTopFiveCadres',
                    ],
                  },
                  100,
                ],
              },
              2, // Round to 2 decimal places
            ],
          },
        },
      },
    ]);
    return this.baseResponse.sendResponse(
      200,
      'Cadre Wise Subscriber Fetched Successfully!!',
      result,
    );
  }

  async moduleUsage(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    const inList = [
      'Knowledge Connect',
      'Chatbot',
      'Diagnosis Algorithm',
      'Treatment Algorithm',
      'Guidance on ADR',
      'Differentiated Care',
      'TB Preventive Treatment',
      'Resource Material',
      'Screening tool',
      'Dynamic Algorithm',
      'ManageTB India',
      'Query2COE',
      'Referral Health Facility',
    ];

    const matchStage: any = {
      $or: [
        { module: { $in: inList } },
        { action: 'knowledge-connect-plugin-click' },
      ],
    };

    if (query && Object.keys(query).length > 0) {
      matchStage['$and'] = [{ ...query }];
    }
    console.log('pagination dto ---->', paginationDto.type);
    if (paginationDto.type === 'days') {
      matchStage['createdAt'] = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        $lt: new Date(),
      };
    }

    const result = await this.subscriberActivityModel.aggregate([
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: matchStage },
      {
        $group: {
          _id: '$module',
          ActivityCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          ModuleName: '$_id',
          ActivityCount: 1,
        },
      },
      { $sort: { ActivityCount: -1 } },
    ]);

    return this.baseResponse.sendResponse(
      200,
      'Module usage counts Fetched Successfully!!',
      result,
    );
  }

  async leaderboard(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    const matchStage: any = {};
    const cacheKey = `leaderBoard:${paginationDto.type}:${JSON.stringify(query)}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      console.log('Returning cached data for', cacheKey);
      return this.baseResponse.sendResponse(
        200,
        'Leaderboard Fetched Successfully!!',
        cachedData,
      );
    }
    if (paginationDto.type === 'days') {
      matchStage['createdAt'] = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
        $lt: new Date(), // Now
      };
    }

    if (query && Object.keys(query).length > 0) {
      Object.assign(matchStage, query);
    }

    const result = await this.SubscriberProgressHistoryModel.aggregate([
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // Preserve empty arrays
      { $match: matchStage },
      {
        $lookup: {
          from: 'leaderboardlevels',
          localField: 'levelId',
          foreignField: '_id',
          as: 'level',
        },
      },
      { $unwind: { path: '$level', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            cadreType: '$user.cadreType',
            levelName: '$level.level',
            levelIndex: '$level.index',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.cadreType',
          levels: {
            $push: {
              levelName: '$_id.levelName',
              levelIndex: '$_id.levelIndex',
              count: '$count',
            },
          },
        },
      },
      {
        $set: {
          levels: {
            $sortArray: {
              input: '$levels',
              sortBy: { levelIndex: 1 },
            },
          },
        },
      },
      {
        $match: { _id: { $ne: null } }, // Exclude null cadreTypes
      },
      {
        $project: {
          _id: 0,
          cadreType: '$_id',
          levels: { levelName: 1, count: 1 },
        },
      },
    ]);
    await this.cacheManager.set(cacheKey, result, 30 * 60 * 1000);
    const cachedData1 = await this.cacheManager.get(cacheKey);
    console.log('cachedData', cachedData1);
    return this.baseResponse.sendResponse(
      200,
      'Leaderboard Fetched Successfully!!',
      result,
    );
  }

  async chatbot(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    let chatbotLast30Days, chatbot;
    if (query && Object.keys(query).length > 0) {
      chatbot = await this.chatConversionModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        // Step 1: Filter by category "system question"
        {
          $unwind: '$message',
        },
        {
          $match: { 'message.category': 'System-Question' },
        },
        {
          $unwind: '$message.question',
        },
        {
          $group: {
            _id: '$message.question.en', // Group by the `en` field
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $project: {
            question: '$_id', // Rename _id to question
            count: 1, // Keep the count
            _id: 0, // Remove the default _id field
          },
        },
        // Step 4: Sort by count in descending order (optional)
        {
          $sort: { count: -1 },
        },
        { $limit: 10 },
      ]);
      chatbotLast30Days = await this.chatConversionModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
            ...query,
          },
        },
        {
          $unwind: '$message',
        },
        {
          $match: { 'message.category': 'System-Question' },
        },
        {
          $unwind: '$message.question',
        },
        {
          $group: {
            _id: '$message.question.en', // Group by the `en` field
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $project: {
            question: '$_id', // Rename _id to question
            count: 1, // Keep the count
            _id: 0, // Remove the default _id field
          },
        },
        {
          $sort: { count: -1 },
        },
        { $limit: 10 },
      ]);
    } else {
      chatbot = await this.chatConversionModel.aggregate([
        // Step 1: Filter by category "system question"
        {
          $unwind: '$message',
        },
        {
          $match: { 'message.category': 'System-Question' },
        },
        {
          $unwind: '$message.question',
        },
        {
          $group: {
            _id: '$message.question.en', // Group by the `en` field
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $project: {
            question: '$_id', // Rename _id to question
            count: 1, // Keep the count
            _id: 0, // Remove the default _id field
          },
        },
        // Step 4: Sort by count in descending order (optional)
        {
          $sort: { count: -1 },
        },
        { $limit: 10 },
      ]);
      chatbotLast30Days = await this.chatConversionModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $unwind: '$message',
        },
        {
          $match: { 'message.category': 'System-Question' },
        },
        {
          $unwind: '$message.question',
        },
        {
          $group: {
            _id: '$message.question.en', // Group by the `en` field
            count: { $sum: 1 }, // Count occurrences
          },
        },
        {
          $project: {
            question: '$_id', // Rename _id to question
            count: 1, // Keep the count
            _id: 0, // Remove the default _id field
          },
        },
        // Step 4: Sort by count in descending order (optional)
        {
          $sort: { count: -1 },
        },
        { $limit: 10 },
      ]);
    }
    const result = {
      chatbot: chatbot,
      chatbotLast30Days: chatbotLast30Days,
    };
    return this.baseResponse.sendResponse(
      200,
      'Chatbot Count Fetched Successfully!!',
      result,
    );
  }

  async manageTb(paginationDto: PaginationDto) {
    const query = await this.buildQuery(paginationDto);
    const matchStage = {};

    if (query && Object.keys(query).length > 0) {
      matchStage['$and'] = [{ ...query }];
    }

    let userIds = [];
    if (Object.keys(matchStage).length > 0) {
      // Get user IDs only if filters are applied
      userIds = await this.subscriberModel
        .find(matchStage, { _id: 1 })
        .lean()
        .then((users) => users.map((user) => user._id));
    }
    // console.log('userId-->', userIds);
    // Step 2: Perform aggregation using filtered userIds
    const data = await this.subscriberActivityModel.aggregate([
      {
        $match: {
          ...(userIds.length > 0 ? { userId: { $in: userIds } } : {}),
          action: {
            $in: [
              'managetb-india-plugin-click',
              'get_prescription',
              'email_prescription',
              'download_prescription',
              'whatsapp_prescription',
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$action', 'managetb-india-plugin-click'] },
                  then: 'Open',
                },
                {
                  case: { $eq: ['$action', 'get_prescription'] },
                  then: 'Submit',
                },
                {
                  case: {
                    $in: [
                      '$action',
                      [
                        'email_prescription',
                        'download_prescription',
                        'whatsapp_prescription',
                      ],
                    ],
                  },
                  then: 'Download',
                },
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      manageTb: data,
    };
    return this.baseResponse.sendResponse(
      200,
      'Manage Tb counts Fetched Successfully!!',
      result,
    );
  }

  async query2coe(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    let drtbCounts,
      drtbCountsLast30Days,
      coeCounts,
      coeCountsLast30Days,
      nodal,
      nodalLast30Days;
    if (query && Object.keys(query).length > 0) {
      drtbCounts = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRaisedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'DRTB', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      drtbCountsLast30Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRaisedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'DRTB', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      coeCounts = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRespondedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'COE', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      coeCountsLast30Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRespondedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'COE', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      const closedQueries = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueries', // Count the matching documents
        },
      ]);
      const closedQueriesLast30Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueries', // Count the matching documents
        },
      ]);
      const openQueries = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'openQueries', // Count the matching documents
        },
      ]);
      const openQueriesLast3Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'raisedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'openQueries', // Count the matching documents
        },
      ]);
      const closedQueriesResponded = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            payload: { $not: { $elemMatch: { status: 'Query Transfer' } } }, // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const closedQueriesRespondedLast30Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            payload: { $not: { $elemMatch: { status: 'Query Transfer' } } }, // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const openQueriesResponded = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: null,
            status: 'In Progress', // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const openQueriesRespondedLast30Days = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'respondedBy',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: null,
            status: 'In Progress', // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      nodal = {
        raisedQuery: openQueries,
        resolvedQuery: closedQueries,
        openQueries: openQueriesResponded,
        closedQueries: closedQueriesResponded,
      };
      nodalLast30Days = {
        raisedQuery: openQueriesRespondedLast30Days,
        resolvedQuery: closedQueriesRespondedLast30Days,
        openQueries: openQueriesLast3Days,
        closedQueries: closedQueriesLast30Days,
      };
    } else {
      drtbCounts = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRaisedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'DRTB', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      drtbCountsLast30Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRaisedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'DRTB', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      coeCounts = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRespondedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'COE', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      coeCountsLast30Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'queryRespondedRole',
            foreignField: '_id',
            as: 'roleData',
          },
        },
        {
          $addFields: {
            roleName: { $arrayElemAt: ['$roleData.name', 0] }, // Extract roleName from the roleData array
          },
        },
        {
          // Step 2: Match only documents where roleName is "DRTB"
          $match: {
            roleName: 'COE', // Filter only those documents where roleName is "DRTB"
          },
        },
        {
          // Step 3: Add a new field to categorize status as "open" or "closed"
          $addFields: {
            statusCategory: {
              $cond: {
                if: { $eq: ['$status', 'In Progress'] }, // Check if the status is "open"
                then: 'In Progress',
                else: 'completed', // Otherwise, consider it "completed"
              },
            },
          },
        },
        {
          // Step 4: Group by roleName and statusCategory, and count the occurrences
          $group: {
            _id: { roleName: '$roleName', statusCategory: '$statusCategory' }, // Group by roleName and statusCategory
            count: { $sum: 1 }, // Count the number of occurrences in each group
          },
        },
        {
          // Optional: Sort the result (for example, by roleName and statusCategory)
          $sort: { '_id.roleName': 1, '_id.statusCategory': 1 },
        },
      ]);
      const closedQueries = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueries', // Count the matching documents
        },
      ]);
      const closedQueriesLast30Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueries', // Count the matching documents
        },
      ]);
      const openQueries = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'openQueries', // Count the matching documents
        },
      ]);
      const openQueriesLast3Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRaisedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array, since it will be an array of objects
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'openQueries', // Count the matching documents
        },
      ]);
      const closedQueriesResponded = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            payload: { $not: { $elemMatch: { status: 'Query Transfer' } } }, // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const closedQueriesRespondedLast30Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: { $ne: null }, // Ensure the response is not null
            payload: { $not: { $elemMatch: { status: 'Query Transfer' } } }, // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const openQueriesResponded = await this.queryModel.aggregate([
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: null,
            status: 'In Progress', // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      const openQueriesRespondedLast30Days = await this.queryModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
              $lt: new Date(), // Now
            },
          },
        },
        {
          $lookup: {
            from: 'roles', // The collection where role data is stored
            localField: 'queryRespondedRole', // Field in your queryModel that references the role collection
            foreignField: '_id', // Field in the roles collection
            as: 'roleData', // Alias for the role data
          },
        },
        {
          $unwind: '$roleData', // Flatten the roleData array
        },
        {
          $match: {
            response: null,
            status: 'In Progress', // Ensure no 'Query Transfer' status in payload
            'roleData.name': 'NODAL', // Filter by roleName "NODAL" in the roleData
          },
        },
        {
          $count: 'closedQueriesResponded', // Count the matching documents
        },
      ]);
      nodal = {
        raisedQuery: openQueries,
        resolvedQuery: closedQueries,
        openQueries: openQueriesResponded,
        closedQueries: closedQueriesResponded,
      };
      nodalLast30Days = {
        raisedQuery: openQueriesRespondedLast30Days,
        resolvedQuery: closedQueriesRespondedLast30Days,
        openQueries: openQueriesLast3Days,
        closedQueries: closedQueriesLast30Days,
      };
    }
    const result = {
      nodal: nodal,
      nodalLast30Days: nodalLast30Days,
      coeCountsLast30Days: coeCountsLast30Days,
      coeCounts: coeCounts,
      drtbCountsLast30Days: drtbCountsLast30Days,
      drtbCounts: drtbCounts,
    };
    return this.baseResponse.sendResponse(
      200,
      'Query2Coe Counts Fetched Successfully!!',
      result,
    );
  }

  async assessmentResponse(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    let assessmentResponseLast30Days, assessmentResponse;
    if (query && Object.keys(query).length > 0) {
      assessmentResponse = await this.assessmentResponseModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $addFields: {
            formattedDate: {
              $dateToString: {
                format: query.createdAt ? '%d-%m-%Y' : '%Y-%m', // Adjust format dynamically
                date: '$createdAt',
              },
            },
          },
        },
        {
          $group: {
            _id: '$formattedDate', // Group by formatted date
            totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
        },
      ]);
      assessmentResponseLast30Days =
        await this.assessmentResponseModel.aggregate([
          {
            $lookup: {
              from: 'subscribers',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $match: {
              ...query,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
                $lt: new Date(), // Now
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
              month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
            },
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' }, // Group by year and month
              totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
          },
        ]);
    } else {
      assessmentResponse = await this.assessmentResponseModel.aggregate([
        {
          $project: {
            year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
            month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
          },
        },
        {
          $group: {
            _id: { year: '$year', month: '$month' }, // Group by year and month
            totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
        },
      ]);
      assessmentResponseLast30Days =
        await this.assessmentResponseModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
                $lt: new Date(), // Now
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
              month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
            },
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' }, // Group by year and month
              totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
          },
        ]);
    }
    const result = {
      assessmentResponse: assessmentResponse,
      assessmentResponseLast30Days: assessmentResponseLast30Days,
    };
    return this.baseResponse.sendResponse(
      200,
      'Assessment Report Fetched Successfully!!',
      result,
    );
  }

  async proAssessmentGraph(paginationDto: PaginationDto) {
    const query = await this.buildQueryByUserId(paginationDto);
    let proAssessmentResponse, proAssessmentResponseLast30Days;
    if (query && Object.keys(query).length > 0) {
      proAssessmentResponse = await this.proAssessmentModel.aggregate([
        {
          $lookup: {
            from: 'subscribers',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: query },
        {
          $addFields: {
            formattedDate: {
              $dateToString: {
                format: query.createdAt ? '%d-%m-%Y' : '%Y-%m', // Adjust format dynamically
                date: '$createdAt',
              },
            },
          },
        },
        {
          $group: {
            _id: '$formattedDate', // Group by formatted date
            totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
        },
      ]);
      proAssessmentResponseLast30Days = await this.proAssessmentModel.aggregate(
        [
          {
            $lookup: {
              from: 'subscribers',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $match: {
              ...query,
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
                $lt: new Date(), // Now
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
              month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
            },
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' }, // Group by year and month
              totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
          },
        ],
      );
    } else {
      proAssessmentResponse = await this.proAssessmentModel.aggregate([
        {
          $project: {
            year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
            month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
          },
        },
        {
          $group: {
            _id: { year: '$year', month: '$month' }, // Group by year and month
            totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
        },
      ]);

      proAssessmentResponseLast30Days =
        await this.assessmentResponseModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
                $lt: new Date(), // Now
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' }, // Extract the year from the 'submittedAt' field
              month: { $month: '$createdAt' }, // Extract the month from the 'submittedAt' field
            },
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' }, // Group by year and month
              totalSubmitted: { $sum: 1 }, // Count the number of assessments submitted in this month
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 }, // Sort by year and month in ascending order
          },
        ]);
    }
    const result = {
      proAssessmentResponse: proAssessmentResponse,
      proAssessmentResponseLast30Days: proAssessmentResponseLast30Days,
    };
    return this.baseResponse.sendResponse(
      200,
      'Pro Assessment Report Fetched Successfully!!',
      result,
    );
  }

  async appOpenedCount(type: string) {
    console.log(`App Opened Count graph --->`);
    const weeksData = []; // To store results for 4 weeks
    const today = new Date(); // Current date
    for (let i = 0; i < 4; i++) {
      // Calculate start and end dates for each week
      let weekEnd, weekStart;
      if (type === 'week') {
        weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - 7 * i);
        weekEnd.setHours(0, 0, 0, 0);

        weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7 * (i + 1));
        weekStart.setHours(0, 0, 0, 0);
        // console.log('weekstart and weekend--?', weekStart, weekEnd);
      } else {
        weekStart = new Date(today.getFullYear(), today.getMonth() - i, 1); // First day of the month
        weekStart.setHours(0, 0, 0, 0); // Reset time to midnight

        weekEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0); // Last day of the month
        weekEnd.setHours(23, 59, 59, 999); // End of the day
      }

      // Perform aggregation for the week
      const result = await this.subscriberActivityModel.aggregate([
        // Stage 1: Filter by date range and action
        {
          $match: {
            createdAt: {
              $gte: weekStart, // Start of the week
              $lt: weekEnd, // End of the week
            },
            action: 'user_home_page_visit', // Match specific action
          },
        },
        // Stage 2: Group by `userId` and count visits
        {
          $group: {
            _id: '$userId',
            visitCount: { $sum: 1 }, // Count visits for each user
          },
        },
        // Stage 3: Categorize visit counts into ranges
        {
          $facet: {
            range_3_to_5: [
              { $match: { visitCount: { $gte: 3, $lte: 5 } } },
              { $count: 'userCount' },
            ],
            range_5_to_7: [
              { $match: { visitCount: { $gte: 5, $lte: 7 } } },
              { $count: 'userCount' },
            ],
            range_7_to_9: [
              { $match: { visitCount: { $gte: 7, $lte: 9 } } },
              { $count: 'userCount' },
            ],
            range_gte_10: [
              { $match: { visitCount: { $gte: 10 } } },
              { $count: 'userCount' },
            ],
          },
        },
      ]);

      // Format results for each range
      const range3To5 = result[0]?.range_3_to_5[0]?.userCount || 0;
      const range5To7 = result[0]?.range_5_to_7[0]?.userCount || 0;
      const range7To9 = result[0]?.range_7_to_9[0]?.userCount || 0;
      const rangeGte10 = result[0]?.range_gte_10[0]?.userCount || 0;

      // Add counts from higher ranges directly into each range's result
      const adjustedRange3To5 = range3To5 + range5To7 + range7To9 + rangeGte10; // 3-5 includes 5-7, 7-9, 10+
      const adjustedRange5To7 = range5To7 + range7To9 + rangeGte10; // 5-7 includes 7-9, 10+
      const adjustedRange7To9 = range7To9 + rangeGte10; // 7-9 includes 10+

      // Add formatted result to the weeksData array
      weeksData.push({
        date: `${weekStart.toISOString().slice(5, 10)}/${weekEnd.toISOString().slice(5, 10)}`, // Format: mm-dd/mm-dd
        range3To5: adjustedRange3To5,
        range5To7: adjustedRange5To7,
        range7To9: adjustedRange7To9,
        rangeGte10,
      });
    }
    return this.baseResponse.sendResponse(
      200,
      'App Opened Counts Fetched Successfully!!',
      weeksData,
    );
  }

  async topoJson() {
    try {
      // Define the file path
      const filePath = join(__dirname, '..', '..', 'india.topo.json'); // /home/hi/work/ns-rewamp-backend/src/dashboard/india.topo.json
      // Read and parse the JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      // Return the parsed JSON data
      return this.baseResponse.sendResponse(200, 'India topo-json!', jsonData);
    } catch (error) {
      // Handle errors (e.g., file not found, JSON parsing issues)
      throw new Error(`Error reading JSON file: ${error.message}`);
    }
  }

  async balanceCheck() {
    console.log('This action return balance of 3rd party api');
    /* Text Local ---------------- */
    const result = await axios.get(
      `${process.env.TEXTLOCAL_API_ENDPOINT}apikey=${process.env.TEXTLOCAL_API_KEY}`,
    );
    // console.log('text local balance -->', result.data);
    if (result.data.balance.sms < 50) {
      await this.emailService.balanceReminder('mehulp@digiflux.io');
    }
    return this.baseResponse.sendResponse(200, 'Balance Details', result.data);
  }
}
