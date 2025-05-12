import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import moment from 'moment';
import { MongoClient } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { All3rdPartyApisResponseDocument } from 'src/all-3rd-party-apis-response/entities/all-3rd-party-apis-response.entity';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { leaderBoardBadgeDocument } from 'src/leader-board/entities/leader-board-badge.entity';
import { leaderBoardLevelDocument } from 'src/leader-board/entities/leader-board-level.entity';
import { leaderBoardTaskDocument } from 'src/leader-board/entities/leader-board-task.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
dotenv.config();

@Injectable()
export class NotificationSchedulerService {
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_ALERTS_URL;
  constructor(
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('All3rdPartyApisResponse')
    private readonly all3rdPartyApisResponseModel: Model<All3rdPartyApisResponseDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @InjectModel('leaderBoardTask')
    private readonly leaderboardTaskModel: Model<leaderBoardTaskDocument>,
    @InjectModel('leaderBoardLevel')
    private readonly leaderBoardLevelModel: Model<leaderBoardLevelDocument>,
    @InjectModel('leaderBoardBadge')
    private readonly leaderBoardBadgeModel: Model<leaderBoardBadgeDocument>,
    @InjectModel('SubscriberProgressHistory')
    private readonly progressHistoryModel: Model<SubscriberProgressHistoryDocument>,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async findInactiveSubscribers(minDaysAgo: number, maxDaysAgo?: number) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - minDaysAgo);

    let maxDate = undefined;
    if (maxDaysAgo) {
      maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - maxDaysAgo);
    }

    const activeUserIds = await this.subscriberActivityModel.distinct(
      'userId',
      {
        action: 'user_home_page_visit',
        createdAt: {
          $gte: maxDate ?? minDate,
          $lte: minDate,
        },
      },
    );
    console.log('active userIds -->', activeUserIds);
    const inactiveSubscribers = await this.subscriberModel
      .find({
        _id: { $nin: activeUserIds },
      })
      .select('_id')
      .exec();
    const userIds = inactiveSubscribers.map((item) => item._id);
    // console.log('inactive users -->', userIds);
    return userIds;
  }

  async notifySubscribers(userIds: any, daysAgoRange: string) {
    for (const userId of userIds) {
      // Notification logic (e.g., sending an email or push notification)
      console.log(
        `Notifying user ${userId} of inactivity for ${daysAgoRange}.`,
      );
      const title = 'App Not Opened';
      const description = `It's been a while... your app is not opened within ${daysAgoRange}`;

      const deviceToken = await this.userDeviceTokenModel
        .find({
          userId: { $in: [userId] },
        })
        .select('notificationToken');
      const tokens = deviceToken.map((item) => item.notificationToken);
      await this.firebaseService.sendMulticastNotificationInBatches(
        tokens,
        title,
        description,
        {},
      );
      return true;
    }
  }

  async buildQuery(assessment: any) {
    let baseQuery;
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
      assessment.cadreType.includes('State_Level')
    ) {
      console.log(`State of subscriber --->`, assessment.stateId);
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

  async plannedAssessment() {
    console.log(
      `This action return planned Assessment Notification to related subscribers`,
    );
    const now = new Date();

    // Define notification intervals
    const intervals = [
      { label: '1 day', minutesBefore: 1440 }, // 1440 minutes = 1 day
      { label: '1 hour', minutesBefore: 60 }, // 60 minutes = 1 hour
      { label: '5 minutes', minutesBefore: 5 }, // 5 minutes
    ];
    for (const interval of intervals) {
      const notificationTime = moment(now)
        .add(interval.minutesBefore, 'minutes')
        .toDate();
      const upcomingAssessments = await this.assessmentModel.find({
        active: true,
        assessmentType: 'planned',
        fromDate: notificationTime,
      });
      for (const assessment of upcomingAssessments) {
        const baseQuery = await this.buildQuery(assessment);
        const subscriber = await this.subscriberModel
          .find(baseQuery)
          .select('_id');
        const userIds = subscriber.map((item) => item._id);
        const title = 'New Assessment';
        const description = `New Assessment: Your Assessment for ${assessment.title} will be live in ${interval.label}. Click here to enroll`;
        const notification = {
          title: title,
          description: description,
          automaticNotificationType: 'Future Assessment',
          userId: userIds,
          link: `${process.env.FRONTEND_URL}/FutureAssessment`,
          assessmentTitle: assessment.title,
          timeToComplete: assessment.timeToComplete,
          createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'), //change to super admin
          isDeepLink: true,
          typeTitle: assessment._id,
          type: 'Automatic Notification',
        };
        const deviceToken = await this.userDeviceTokenModel
          .find({
            userId: { $in: userIds },
          })
          .select('notificationToken');
        const notificationData = await new this.userNotificationModel(
          notification,
        ).save();

        await this.notificationQueueService.addNotificationToQueue(
          notificationData._id.toString(),
          notification,
          deviceToken,
          'assessment',
        );
        return true;
      }
    }
  }

  async notifyPendingProAssessment() {
    console.log(
      `This scheduler logic send notification to subscriber who haven't completed their Pro active assessments`,
    );
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const pendingAssessmentsGroupedByUser = await collection
        .aggregate([
          {
            // Unwind the assessments array to handle each assessment separately
            $unwind: '$assessments',
          },
          {
            // Match only assessments with pending: 'yes'
            $match: {
              'assessments.pending': 'yes',
            },
          },
          {
            // Group by user_id, and collect assessments in an array
            $group: {
              _id: '$user_id', // Group by user_id
            },
          },
          {
            // Optionally, project the results to rename _id to user_id
            $project: {
              _id: 0,
              user_id: '$_id',
              // pendingAssessments: 1,
            },
          },
        ])
        .toArray();
      console.log(
        'grouped pending assessments by user-->',
        pendingAssessmentsGroupedByUser,
      );
      const subscriber = pendingAssessmentsGroupedByUser.map(
        (item) => new mongoose.Types.ObjectId(item.user_id),
      );
      const deviceToken = await this.userDeviceTokenModel
        .find({
          userId: { $in: subscriber },
        })
        .select('notificationToken');
      if (pendingAssessmentsGroupedByUser.length > 0) {
        // Get all subscribers
        const notification = {
          assessmentTitle: { en: 'Pro Active Assessment' },
          description: `Pending Pro Active Assessment`,
          type: 'Current Assessment',
          userId: subscriber,
          link: `${process.env.FRONTEND_URL}/CurrentAssessment`,
          createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'), //change to super admin
        };
        await this.firebaseService.sendAllTypeOfNotification(
          notification,
          deviceToken,
          'assessment',
        );
      }
    } catch (error) {
      console.error('Error performing operation:', error);
      return error;
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async notifyNewAssessmentDetails() {
    console.log(
      `This scheduler logic send notification to subscriber for new pro assessments`,
    );
    const currentDate = new Date();
    const saturdayStart = new Date(currentDate);
    saturdayStart.setDate(currentDate.getDate() - 1); // Set to previous day
    saturdayStart.setHours(0, 0, 0, 0); // Start of Saturday

    const saturdayEnd = new Date(currentDate);
    saturdayEnd.setDate(currentDate.getDate() - 1); // Set to previous day
    saturdayEnd.setHours(23, 59, 59, 999); // End of Saturday
    console.log('saturday sunday date time --->', saturdayStart, saturdayEnd);
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');
      const assessments = await collection.findOne({
        created_at: { $gte: saturdayStart, $lte: saturdayEnd },
      });
      console.log('assessments---->', assessments);
      let deviceToken, allSubscribers;
      if (assessments) {
        allSubscribers = assessments.map((item) => item.user_id);
        deviceToken = await this.userDeviceTokenModel
          .find({
            userId: { $in: [allSubscribers] },
          })
          .select('notificationToken');
      }

      if (assessments) {
        // Get all subscribers
        const notification = {
          assessmentTitle: { en: 'Pro Active Assessment' },
          description: `Pending Pro Active Assessment`,
          type: 'Current Assessment',
          userId: allSubscribers,
          link: `${process.env.FRONTEND_URL}/CurrentAssessment`,
          createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'), //change to super admin
        };
        await this.firebaseService.sendAllTypeOfNotification(
          notification,
          deviceToken,
          'assessment',
        );
      }
    } catch (error) {
      console.error('Error performing operation:', error);
      return error;
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async leaderBoardRankDownFall() {
    console.log(`This action returns leaderboard downfall activity`);
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const subscriber = await this.progressHistoryModel.aggregate([
      {
        $match: {
          updatedAt: { $gte: fifteenDaysAgo },
        },
      },
      {
        $lookup: {
          from: 'levels', // The collection name for levels
          localField: 'levelId',
          foreignField: '_id',
          as: 'level',
          pipeline: [{ $match: { isFinal: true } }],
        },
      },
      {
        $unwind: '$level', // Only include if level is found
      },
      {
        $lookup: {
          from: 'badges', // The collection name for badges
          localField: 'badgeId',
          foreignField: '_id',
          as: 'badge',
          pipeline: [{ $match: { isFinal: true } }],
        },
      },
      {
        $unwind: '$badge', // Only include if badge is found
      },
      {
        $project: {
          userId: 1,
          levelId: '$level',
          badgeId: '$badge',
        },
      },
    ]);
    const ids = subscriber.map((ids) => ids.userId);
    const subscriberList = await this.subscriberModel.find({
      _id: { $nin: ids },
    });
    const userIds = subscriberList.map((ids) => ids._id);
    if (userIds.length > 0) {
      const notification = {
        title: 'Competition Increased',
        description:
          'Your Leaderboard rank is dropping, click here to check your competition.',
        automaticNotificationType: 'Leader Board',
        userId: userIds,
        link: `${process.env.FRONTEND_URL}/leaderBoardScreen`,
        createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'),
        isDeepLink: true,
        type: 'Automatic Notification',
      };
      const notificationData = await new this.userNotificationModel(
        notification,
      ).save();
      const deviceToken = await this.userDeviceTokenModel
        .find({
          userId: { $in: userIds },
        })
        .select('notificationToken');

      await this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'leaderboard',
      );
      return true;
    }
  }

  async leaderBoardPendingBadge() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const leaderboard = await this.progressHistoryModel
      .find({ updatedAt: { $lt: tenDaysAgo } })
      .select('userId levelId badgeId updatedAt')
      .lean();
    const subscribersIds = leaderboard.map((ids) => ids.userId);
    if (subscribersIds.length > 0) {
      const notification = {
        title: 'Leaderboard Task',
        description:
          'You have some pending tasks to achieve the next Level, Check out now',
        automaticNotificationType: 'Leader Board',
        userId: subscribersIds,
        link: `${process.env.FRONTEND_URL}/Tasks`,
        createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'),
        isDeepLink: true,
        type: 'Automatic Notification',
      };

      // Create notification in the database
      const notificationData = await new this.userNotificationModel(
        notification,
      ).save();
      const deviceToken = await this.userDeviceTokenModel
        .find({
          userId: { $in: subscribersIds },
        })
        .select('notificationToken');

      await this.notificationQueueService.addNotificationToQueue(
        notificationData._id.toString(),
        notification,
        deviceToken,
        'leaderboard',
      );
      return true;
    }
  }

  async leaderBoardBadgeUpdate() {
    console.log(`This Action returns leaderboard update badge Info`);
    console.log(`Starting leaderboard badge update...`);
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

    const activities = await this.progressHistoryModel
      .find({ updatedAt: { $gte: fiveDaysAgo } })
      .select('-subscriberHistory')
      .lean();

    if (!activities.length) {
      console.log('No recent activities found.');
      return;
    }

    console.log('Processing', activities.length, 'activities');
    const badgeCache = new Map();

    for (const activity of activities) {
      await this.leaderboardCalculation(activity, badgeCache);
    }
  }

  async leaderboardCalculation(activity: any, badgeCache) {
    console.log('activities-->', activity);
    let badgeId = activity.badgeId;

    if (!badgeId) {
      if (!badgeCache.has(1)) {
        const firstBadge = await this.leaderBoardBadgeModel
          .findOne({ index: 1 })
          .select('_id');
        badgeCache.set(1, firstBadge);
      }
      badgeId = badgeCache.get(1)._id;
    }

    const badge = await this.leaderBoardBadgeModel
      .findById(badgeId)
      .select('index');

    let tasks = null;
    if (!badgeCache.has(badge.index + 1)) {
      const nextBadge = await this.leaderBoardBadgeModel
        .findOne({ index: badge.index + 1 })
        .select('levelId badge')
        .lean();
      badgeCache.set(badge.index + 1, nextBadge);
    }

    const newBadge = badgeCache.get(badge.index + 1);
    if (newBadge) {
      tasks = await this.leaderboardTaskModel.findOne({
        badgeId: newBadge._id,
      });
    }

    const [{ totalTaskSum = 0 } = {}] =
      await this.leaderboardTaskModel.aggregate([
        { $group: { _id: null, totalTaskSum: { $sum: '$totalTask' } } },
      ]);

    if (activity.taskCompleted === totalTaskSum) {
      console.log('User already completed all tasks.');
      return;
    }

    if (
      tasks &&
      activity.minSpent &&
      activity.minSpent >= tasks.minSpent &&
      activity.subModuleUsageCount >= tasks.subModuleUsageCount &&
      activity.appOpenedCount >= tasks.appOpenedCount &&
      activity.chatbotUsageCount >= tasks.chatbotUsageCount &&
      activity.kbaseCompletion >= tasks.kbaseCompletion &&
      activity.correctnessOfAnswers >= tasks.correctnessOfAnswers &&
      activity.totalAssessments >= tasks.totalAssessments
    ) {
      console.log('User meets criteria for a badge upgrade.');

      const [oldLevel, oldBadge, currentLevel, newBadgeData] =
        await Promise.all([
          this.leaderBoardLevelModel.findById(activity.levelId).select('level'),
          this.leaderBoardBadgeModel
            .findById(activity.badgeId || badgeId)
            .select('badge'),
          this.leaderBoardLevelModel.findById(tasks.levelId).select('level'),
          this.leaderBoardBadgeModel.findById(tasks.badgeId).select('badge'),
        ]);

      const notification = {
        title: 'New Achievement',
        description: 'You earned a new Badge!',
        oldLevel: oldLevel.level,
        currentLevel: currentLevel.level,
        oldBadge: oldBadge.badge,
        currentBadge: newBadgeData.badge,
      };

      console.log('Sending notification:', notification);

      await this.progressHistoryModel.findOneAndUpdate(
        { userId: activity.userId },
        {
          $set: { levelId: tasks.levelId, badgeId: tasks.badgeId },
          $inc: { taskCompleted: tasks.totalTask },
          $push: { subscriberHistory: activity },
        },
      );

      const deviceToken = await this.userDeviceTokenModel
        .find({ userId: activity.userId })
        .select('notificationToken');

      await this.firebaseService.sendAllTypeOfNotification(
        notification,
        deviceToken,
        'deep-linking',
      );
    } else {
      console.log('User does not meet the criteria for a badge upgrade.');
    }

    return true;
  }

  async get3rdPartyApiResponse() {
    console.log('inside get 3rd party apis ---->');
    const apisToCheck = [
      {
        name: 'Km-nodes',
        url: process.env.NTEP_URL,
      },
      { name: 'Course', url: process.env.COURSE_NTEP_API },
      {
        name: 'Taxonomy',
        url: process.env.CADRE_MAPPING_API,
      },
      {
        name: 'Manage-Tb',
        url: process.env.MANAGE_TB_URL,
      },
      {
        name: 'Question',
        url: process.env.QUESTION_URL,
      },
      {
        name: 'ChatBot',
        url: process.env.CHATBOT_URL,
      },
      {
        name: 'Pro-active',
        url: process.env.ASSESSMENT_URL,
      },
    ];
    let results;

    for (const api of apisToCheck) {
      console.log('api.url', api.url);
      try {
        let response;
        if (api.name == 'Course') {
          response = await axios.get(api.url, {
            auth: {
              username: process.env.NTEP_CRED,
              password: process.env.NTEP_CRED,
            },
          });
        } else if (api.name == 'Question') {
          response = await axios.get(api.url, {
            headers: {
              Authorization: process.env.QUESTION_AUTH,
            },
          });
        } else {
          response = await axios.get(api.url);
        }

        if (response.status === 200) {
          results = {
            api: api.name,
            status: 'OK',
            message: 'API is working fine',
          };
          await new this.all3rdPartyApisResponseModel(results).save();
        } else {
          results = {
            api: api.name,
            status: 'FAIL',
            message: `Unexpected status code: ${response.status}`,
          };
          await new this.all3rdPartyApisResponseModel(results).save();
          try {
            await axios.post(this.webhookUrl, {
              text: `*API:* ${api.url}\n*Status:* ${response.status}\n*Message:* Unexpected status code: ${response.status}`,
            });
          } catch (error) {
            console.error('❌ Error sending message to Slack', error);
          }
        }
      } catch (error) {
        results = {
          api: api.name,
          status: error.response ? error.response.status : 'FAIL',
          message: `Error: ${error.response ? error.response.status : error.message}`,
        };
        await new this.all3rdPartyApisResponseModel(results).save();
        try {
          await axios.post(this.webhookUrl, {
            text: `*API:* ${api.url}\n*Status:* FAIL\n*Message:* Unexpected status code: ${error.response ? error.response.status : error.message}`,
          });
        } catch (error) {
          console.error('❌ Error sending message to Slack', error);
        }
      }
    }
    return results;
  }
}
