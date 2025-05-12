import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { leaderBoardLevelDocument } from 'src/leader-board/entities/leader-board-level.entity';
import { LeaderBoardService } from 'src/leader-board/leader-board.service';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { SubscriberProgressHistoryDocument } from './entities/subscriber-progress-history';

@Injectable()
export class SubscriberProgressService {
  constructor(
    @InjectModel('subscriberProgressHistory')
    private readonly subscriberProgressHistoryModel: Model<SubscriberProgressHistoryDocument>,

    @InjectModel('SubscriberActivity')
    private readonly SubscriberActivityModel: Model<SubscriberActivityDocument>,

    @InjectModel('leaderBoardTask')
    private readonly leaderBoardTasksModel: Model<SubscriberActivityDocument>,

    @InjectModel('leaderBoardLevel')
    private readonly leaderBoardLevelModel: Model<leaderBoardLevelDocument>,

    @Inject(forwardRef(() => LeaderBoardService))
    private readonly LeaderBoardServices: LeaderBoardService,

    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,

    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,

    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
  ) {}

  async updateSubscriberProgress(data: any) {
    try {
      console.log(data, '----data');

      const actionType = { action: data.action };

      // Determine the field to increment based on the action type
      let incrementField;
      if (actionType.action === 'user_home_page_visit') {
        incrementField = 'appOpenedCount';
      } else if (
        ['Chat Keyword Fetched', 'Search By Keyword Fetched'].includes(
          actionType.action,
        )
      ) {
        incrementField = 'chatbotUsageCount';
      } else {
        console.log('Unsupported action type : ', actionType.action);
        return null;
      }

      // Check if the document exists
      const subscriber = await this.subscriberProgressHistoryModel.findOne({
        userId: data.userId,
      });

      if (subscriber) {
        // Update the existing subscriber's progress
        const result = await this.subscriberProgressHistoryModel.updateOne(
          { userId: data.userId },
          {
            $inc: { [incrementField]: 1 },
            $set: { updatedAt: new Date() },
          },
        );
        console.log(result, '----update result');
      } else {
        // If subscriber does not exist, create a new one with default values
        // First, fetch the first badge and level
        const firstLevel = await this.leaderBoardLevelModel
          .findOne()
          .sort({ index: 1 }) // Sort by index in ascending order
          .limit(1);

        if (!firstLevel) {
          console.log('No badge found');
          return null;
        }

        // Create a new subscriber with default values and add the badge and level

        if (!subscriber) {
          // If no progress exists, create a new document
          return this.subscriberProgressHistoryModel.create({
            userId: data.userId,
            appOpenedCount: incrementField == 'appOpenedCount' ? 1 : 0,
            chatbotUsageCount: incrementField == 'chatbotUsageCount' ? 1 : 0,
            updatedAt: new Date(),
            levelId: firstLevel?._id || null,
          });
        }

        // const result = await newSubscriber.save();
      }
    } catch (err) {
      console.log(err);
    }
  }
  async updateSubModuleUsageCount(data: any) {
    try {
      console.log(data, '----data');
      if (!data?.timeSpent && !data?.totalTime) {
        return;
      }
      const { userId } = data;

      // Aggregation query to calculate count based on conditions
      const [{ count: subModuleUsedCount } = { count: 0 }] =
        await this.SubscriberActivityModel.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              action: 'submodule_usage',
            },
          },
          {
            $group: {
              _id: {
                subModule: '$subModule',
                totalTime: '$totalTime', // Unique `totalTime` for each subModule
              },
              uniqueTotalTime: { $first: '$totalTime' }, // Get unique totalTime
              totalTimeSpentSum: { $sum: '$timeSpent' }, // Sum `timeSpent` for each group
            },
          },
          {
            $project: {
              _id: 0,
              uniqueTotalTime: 1,
              totalTimeSpentSum: 1,
              isValid: {
                $cond: {
                  if: { $gte: ['$totalTimeSpentSum', '$uniqueTotalTime'] },
                  then: 1,
                  else: 0,
                },
              }, // Check if condition is met
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: '$isValid' }, // Count all valid entries
            },
          },
        ]);

      if (subModuleUsedCount > 0) {
        // Update subModuleUsageCount in SubscriberProgressHistoryModel
        await this.subscriberProgressHistoryModel.updateOne(
          { userId: new mongoose.Types.ObjectId(userId) },
          {
            $set: {
              subModuleUsageCount: subModuleUsedCount, // Store the count
              updatedAt: new Date(),
            },
          },
        );

        console.log(
          `Updated subModuleUsageCount for userId ${userId}: +${subModuleUsedCount}`,
        );
      } else {
        console.log(`No matching activities found for userId ${userId}.`);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async updateOverallAppUsageMinSpent(data: any) {
    if (data?.timeSpent > 0) {
      const result = await this.SubscriberActivityModel.aggregate([
        {
          $match: {
            module: 'overall_app_usage',
            action: 'app_usage',
            userId: data.userId,
          },
        },
        {
          $group: {
            _id: '$userId',
            totalTime: { $sum: '$timeSpent' }, // Sum the time spent in seconds
          },
        },
      ]);

      if (result.length === 0) {
        throw new Error(`No activity data found for userId ${data.userId}.`);
      }

      // Convert total time to minutes
      const totalSeconds = result[0].totalTime;
      const totalMinutes = Math.floor(totalSeconds / 60); // Convert seconds to minutes
      console.log({ totalSeconds, totalMinutes });
      // Update the 'minSpent' field in 'subscriberProgressHistoryModel'
      await this.subscriberProgressHistoryModel.updateOne(
        { userId: data.userId }, // match the user
        { $set: { minSpent: totalMinutes } }, // set the calculated minSpent
      );

      console.log(
        `Updated minSpent to ${totalMinutes} minutes for user ${data.userId}.`,
      );
      return totalMinutes;
    } // Return the updated value
  }
  async getAndUpdateProgressByLevel(userId: string) {
    try {
      // Fetch user activities
      const userActivities = await this.subscriberProgressHistoryModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!userActivities) {
        return {
          status: false,
          message: 'No progress history found for the user',
        };
      }

      // Fetch predefined tasks grouped by levels
      const taskData = await this.LeaderBoardServices.getTasksGroupedByLevel();

      if (!taskData || !taskData.data.length) {
        return {
          status: false,
          message: 'No task data available',
        };
      }

      // const subscriberHistory = userActivities.subscriberHistory || [];
      const formattedResponse = [];

      // Process levels and tasks
      taskData.data.forEach((levelData) => {
        let totalTasks = 0;
        let completedTasks = 0;

        const tasksProgress = levelData.tasks.map((task) => {
          // Calculate progress for each action
          const actionsProgress = [
            {
              action: 'appOpenedCount',
              current: userActivities.appOpenedCount || 0,
              target: task.appOpenedCount || 0,
              isComplete:
                (userActivities.appOpenedCount || 0) >=
                (task.appOpenedCount || 0),
            },
            {
              action: 'minSpent',
              current: userActivities.minSpent || 0,
              target: task.minSpent || 0,
              isComplete:
                (userActivities.minSpent || 0) >= (task.minSpent || 0),
            },
            {
              action: 'subModuleUsageCount',
              current: userActivities.subModuleUsageCount || 0,
              target: task.subModuleUsageCount || 0,
              isComplete:
                (userActivities.subModuleUsageCount || 0) >=
                (task.subModuleUsageCount || 0),
            },
            {
              action: 'chatbotUsageCount',
              current: userActivities.chatbotUsageCount || 0,
              target: task.chatbotUsageCount || 0,
              isComplete:
                (userActivities.chatbotUsageCount || 0) >=
                (task.chatbotUsageCount || 0),
            },
            {
              action: 'kbaseCompletion',
              current: userActivities.kbaseCompletion || 0,
              target: task.kbaseCompletion || 0,
              isComplete:
                (userActivities.kbaseCompletion || 0) >=
                (task.kbaseCompletion || 0),
            },
            {
              action: 'totalAssessments',
              current: userActivities.totalAssessments || 0,
              target: task.totalAssessments || 0,
              isComplete:
                (userActivities.totalAssessments || 0) >=
                (task.totalAssessments || 0),
            },

            {
              action: 'correctnessOfAnswers',
              current: userActivities.correctnessOfAnswers || 0,
              target: task.correctnessOfAnswers || 0,
              isComplete:
                (userActivities.correctnessOfAnswers || 0) >=
                (task.correctnessOfAnswers || 0),
            },
          ];

          // Count tasks where target > 0
          const validActions = actionsProgress.filter(
            (action) => action.target > 0,
          );
          totalTasks += validActions.length;

          // Count completed tasks
          completedTasks += validActions.filter(
            (action) => action.isComplete,
          ).length;

          return {
            badge_name: task.badge_name,
            badgeId: task.badgeId,
            progress: actionsProgress,
          };
        });

        // Add level data to the response
        formattedResponse.push({
          level: levelData.level,
          levelId: levelData?.levelId,
          tasksProgress,
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks, // Calculate pending tasks
        });
      });

      return this.baseResponse.sendResponse(
        200,
        'Progress fetched and history updated successfully',
        formattedResponse,
      );
    } catch (error) {
      console.error('Error processing progress:', error);
      return {
        status: false,
        message: 'Error processing progress',
      };
    }
  }

  async getAchievementByLevelAndBadge(userId: string) {
    try {
      const userActivities =
        await this.subscriberProgressHistoryModel.aggregate([
          {
            // Match the specific user
            $match: { userId: new mongoose.Types.ObjectId(userId) },
          },
          {
            // Unwind the subscriberHistory array to process each entry
            $unwind: '$subscriberHistory',
          },
          {
            // Lookup for badgeId to get the badge name
            $lookup: {
              from: 'leaderboardbadges', // Name of the Badge collection
              localField: 'subscriberHistory.badgeId',
              foreignField: '_id',
              as: 'badgeDetails',
            },
          },
          {
            // Lookup for levelId to get the level name
            $lookup: {
              from: 'leaderboardlevels', // Name of the Level collection
              localField: 'subscriberHistory.levelId',
              foreignField: '_id',
              as: 'levelDetails',
            },
          },
          {
            // Add badge and level details for readability
            $addFields: {
              badgeName: { $arrayElemAt: ['$badgeDetails.badge', 0] }, // Extract the badge name
              // levelName: { $arrayElemAt: ['$levelDetails.level', 0] }, // Extract the level name
            },
          },
          {
            // Group by badgeId and levelId to calculate the number of achievements
            $group: {
              _id: {
                badgeId: '$subscriberHistory.badgeId',
                // levelId: '$subscriberHistory.levelId',
              },
              badgeName: { $first: '$badgeName' }, // Keep the badge name
              // levelName: { $first: '$levelName' }, // Keep the level name
              totalAchievements: { $sum: 1 }, // Count the achievements
            },
          },
          {
            $match: {
              '_id.badgeId': { $ne: null }, // Filter out null badgeId
            },
          },
          {
            // Sort results by the number of achievements (descending)
            $sort: { totalAchievements: -1 },
          },
        ]);

      if (!userActivities) {
        return this.baseResponse.sendError(
          400,
          'No progress history found for the user',
          [],
        );
      }
      // console.log('user Activities --->', userActivities);
      return this.baseResponse.sendResponse(
        200,
        'Achievements !!',
        userActivities,
      );
    } catch (error) {
      console.error('Error processing progress:', error);
      return {
        status: false,
        message: 'Error processing progress',
      };
    }
  }

  async getLeaderboardDetailsOfUser(id: string) {
    console.log(`This action return user leaderboard details to admin user`);

    const leaderboard = await this.subscriberProgressHistoryModel
      .findOne({
        userId: new mongoose.Types.ObjectId(id),
      })
      .populate([
        {
          path: 'userId',
          select: 'name email phoneNo',
        },
        {
          path: 'levelId',
          select: 'level',
        },
        { path: 'badgeId', select: 'badge' },
      ])
      .sort({ createdAt: -1 })
      .select('-subscriberHistory')
      .lean();
    const result = await this.leaderBoardTasksModel.aggregate([
      {
        $group: {
          _id: null,
          totalTaskSum: { $sum: '$totalTask' },
        },
      },
    ]);
    console.log('after aggregate');
    const totalTaskSum = result.length > 0 ? result[0].totalTaskSum : 0;
    if (leaderboard) {
      // const leaderboardObj = leaderboard.toObject() as Record<string, any>; // Convert to plain object
      (leaderboard as any).performance = Math.round(
        (leaderboard.taskCompleted / totalTaskSum) * 100,
      );
    }
    if (!leaderboard) {
      return this.baseResponse.sendResponse(
        500,
        'Error processing leaderboard details',
        null,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      'Leaderboard Details Fetch Successfully',
      leaderboard,
    );
  }

  async getOverallAchievement(userId: string) {
    try {
      // Step 1: Fetch total tasks from LeaderBoardTasks
      const totalTaskResult = await this.leaderBoardTasksModel.aggregate([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$totalTask' }, // Sum up all totalTask fields
          },
        },
      ]);
      if (!totalTaskResult.length || !totalTaskResult) {
        return {
          status: false,
          message: 'No tasks found in LeaderBoardTasks',
        };
      }

      const totalTasks = totalTaskResult[0].totalTasks || 0;

      // Step 2: Fetch user activities
      const userActivities = await this.subscriberProgressHistoryModel
        .findOne({
          userId: new mongoose.Types.ObjectId(userId),
        })
        .populate([
          {
            path: 'levelId',
            select: 'level',
          },
          {
            path: 'badgeId',
            select: 'badge',
          },
        ]);

      if (!userActivities) {
        return {
          status: false,
          message: 'No progress history found for the user',
        };
      }

      // Step 3: Fetch predefined tasks grouped by levels
      const taskData = await this.LeaderBoardServices.getTasksGroupedByLevel();

      if (!taskData || !taskData.data.length) {
        return {
          status: false,
          message: 'No task data available',
        };
      }

      // Calculate pending tasks
      const pendingTasks = totalTasks - userActivities.taskCompleted;
      const currentLevel = (userActivities.levelId as any)?.level;
      const currentBadge = (userActivities.badgeId as any)?.badge;

      // Return the aggregated data
      console.log(
        'total task and completed task--->',
        totalTaskResult,
        userActivities.taskCompleted,
      );
      return {
        data: {
          totalTasks,
          completedTasks: userActivities.taskCompleted,
          pendingTasks,
          currentLevel,
          currentBadge,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error processing overall progress',
      };
    }
  }

  async top3SubscriberList(userData: any) {
    try {
      // Step 1: Fetch total tasks from LeaderBoardTasks
      const currentUser = await this.subscriberModel
        .findOne({ _id: userData._id })
        .select('cadreId');
      if (!currentUser || !currentUser.cadreId) {
        return {
          status: false,
          message: 'Current user does not have a valid cadreId',
        };
      }

      const currentCadreId = currentUser.cadreId;
      const totalTaskResult = await this.leaderBoardTasksModel.aggregate([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$totalTask' }, // Sum up all totalTask
          },
        },
      ]);
      if (!totalTaskResult.length || !totalTaskResult) {
        return;
        // throw new Error('No tasks found in LeaderBoardTasks');
      }

      const totalTasks = totalTaskResult[0].totalTasks || 0;

      // Step 2: Fetch completed tasks and subscriber details

      const usersProgress = await this.subscriberProgressHistoryModel.aggregate(
        [
          {
            $lookup: {
              from: 'subscribers', // Join with Subscribers collection
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
          {
            $match: {
              'userDetails.cadreId': currentCadreId, // Match users with the same cadreId as the current user
            },
          },
          {
            $lookup: {
              from: 'cadres', // Join with Cadres collection
              localField: 'userDetails.cadreId',
              foreignField: '_id',
              as: 'cadreDetails',
            },
          },
          {
            $unwind: {
              path: '$cadreDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'leaderboardlevels', // Join with LeaderBoardLevels collection
              localField: 'levelId',
              foreignField: '_id',
              as: 'levelDetails',
            },
          },
          {
            $unwind: {
              path: '$levelDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'leaderboardbadges', // Join with LeaderBoardBadges collection
              localField: 'badgeId',
              foreignField: '_id',
              as: 'badgeDetails',
            },
          },
          {
            $unwind: {
              path: '$badgeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              userId: 1,
              taskCompleted: 1,
              subscriberHistory: 1,
              name: '$userDetails.name',
              profileImage: '$userDetails.profileImage',
              cadreTitle: '$cadreDetails.title',
              cadreType: '$cadreDetails.cadreType',
              level: '$levelDetails.level', // Get level name from LeaderBoardLevels
              badge: '$badgeDetails.badge', // Get badge name from LeaderBoardBadges
            },
          },
          {
            $sort: { taskCompleted: -1 }, // Sort by taskCompleted in descending order
          },
          { $limit: 3 },
        ],
      );

      if (!usersProgress.length || !usersProgress) {
        return;
        // throw new Error('No progress data found for users');
      }

      // Step 3: Calculate progress for all users
      const allUsersProgress = usersProgress.map((user) => {
        // Check subscriberHistory for level and badge
        return {
          userId: user.userId,
          name: user.name || 'Unknown',
          cadreTitle: user.cadreTitle || 'Unknown',
          profileImage: user.profileImage || null,
          cadreType: user.cadreType || 'Not Assigned', // Include cadre details
          completedTasks: user.taskCompleted || 0,
          totalTasks,
          percentageCompleted:
            totalTasks > 0
              ? (((user.taskCompleted || 0) / totalTasks) * 100).toFixed(2)
              : '0.00',
          level: user?.level,
          badge: user?.badge,
        };
      });
      if (allUsersProgress.length == 2) {
        allUsersProgress.push({
          userId: '669f5ef97978bc59b8224d42',
          name: 'Your Competitors1',
          cadreTitle: allUsersProgress[0].cadreTitle || '',
          profileImage: null,
          cadreType: allUsersProgress[0].cadreType || 'Not Assigned',
          completedTasks: 0,
          totalTasks: totalTasks,
          percentageCompleted: '0.00',
          level: 'Beginner',
          badge: '',
        });
      } else if (allUsersProgress.length == 1) {
        allUsersProgress.push(
          {
            userId: '669f5ef97978bc59b8224d42',
            name: 'Your Competitors1',
            cadreTitle: allUsersProgress[0].cadreTitle || '',
            profileImage: null,
            cadreType: allUsersProgress[0].cadreType || 'Not Assigned',
            completedTasks: 0,
            totalTasks: totalTasks,
            percentageCompleted: '0.00',
            level: 'Beginner',
            badge: '',
          },
          {
            userId: '669f5ef97978bc59b8224d43',
            name: 'Your Competitors2',
            cadreTitle: allUsersProgress[0].cadreTitle || '',
            profileImage: null,
            cadreType: allUsersProgress[0].cadreType || 'Not Assigned',
            completedTasks: 0,
            totalTasks: 'Beginner',
            percentageCompleted: '0.00',
            level: 'Beginner',
            badge: '',
          },
        );
      }

      // Step 4: Return combined response
      return this.baseResponse.sendResponse(
        200,
        'User and all users task summary fetched successfully',
        allUsersProgress,
      );
    } catch (error) {
      return {
        status: false,
        message: `Error fetching task summary: ${error.message}`,
      };
    }
  }

  async getUserAndAllUsersTaskSummary(
    userData: any,
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const skip = Number(limit) * (Number(page) - 1);
    console.log('page and limit,skip ---->', page, limit, skip);

    try {
      // Step 1: Fetch total tasks from LeaderBoardTasks
      const currentUser = await this.subscriberModel
        .findOne({ _id: userData._id })
        .select('cadreId');
      if (!currentUser || !currentUser.cadreId) {
        return {
          status: false,
          message: 'Current user does not have a valid cadreId',
        };
      }

      const currentCadreId = currentUser.cadreId;
      const totalTaskResult = await this.leaderBoardTasksModel.aggregate([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: '$totalTask' }, // Sum up all totalTask
          },
        },
      ]);
      if (!totalTaskResult.length || !totalTaskResult) {
        return;
        // throw new Error('No tasks found in LeaderBoardTasks');
      }

      const totalTasks = totalTaskResult[0].totalTasks || 0;

      // Step 2: Fetch completed tasks and subscriber details

      const usersProgress = await this.subscriberProgressHistoryModel.aggregate(
        [
          {
            $lookup: {
              from: 'subscribers', // Join with Subscribers collection
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
          {
            $match: {
              'userDetails.cadreId': currentCadreId, // Match users with the same cadreId as the current user
            },
          },
          {
            $lookup: {
              from: 'cadres', // Join with Cadres collection
              localField: 'userDetails.cadreId',
              foreignField: '_id',
              as: 'cadreDetails',
            },
          },
          {
            $unwind: {
              path: '$cadreDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'leaderboardlevels', // Join with LeaderBoardLevels collection
              localField: 'levelId',
              foreignField: '_id',
              as: 'levelDetails',
            },
          },
          {
            $unwind: {
              path: '$levelDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'leaderboardbadges', // Join with LeaderBoardBadges collection
              localField: 'badgeId',
              foreignField: '_id',
              as: 'badgeDetails',
            },
          },
          {
            $unwind: {
              path: '$badgeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              userId: 1,
              taskCompleted: 1,
              subscriberHistory: 1,
              name: '$userDetails.name',
              profileImage: '$userDetails.profileImage',
              cadreTitle: '$cadreDetails.title',
              cadreType: '$cadreDetails.cadreType',
              level: '$levelDetails.level', // Get level name from LeaderBoardLevels
              badge: '$badgeDetails.badge', // Get badge name from LeaderBoardBadges
            },
          },
          {
            $sort: { taskCompleted: -1 }, // Sort by taskCompleted in descending order
          },
        ],
      );

      if (!usersProgress.length || !usersProgress) {
        return;
        // throw new Error('No progress data found for users');
      }

      // Step 3: Calculate progress for all users
      const allUsersProgress = usersProgress
        .map((user) => {
          // Check subscriberHistory for level and badge
          return {
            userId: user.userId,
            name: user.name || 'Unknown',
            cadreTitle: user.cadreTitle || 'Unknown',
            profileImage: user.profileImage || null,
            cadreType: user.cadreType || 'Not Assigned', // Include cadre details
            completedTasks: user.taskCompleted || 0,
            totalTasks,
            percentageCompleted:
              totalTasks > 0
                ? (((user.taskCompleted || 0) / totalTasks) * 100).toFixed(2)
                : '0.00',
            level: user?.level,
            badge: user?.badge,
          };
        })
        .slice((page - 1) * limit, page * limit);

      const result = {
        list: allUsersProgress,
        currentPage: Number(page),
        totalPages: Math.ceil(usersProgress.length / limit),
        totalItems: usersProgress.length,
      };

      // Step 4: Return combined response
      return this.baseResponse.sendResponse(
        200,
        'User and all users task summary fetched successfully',
        result,
      );
    } catch (error) {
      console.error('Error fetching task summary:', error);
      return {
        status: false,
        message: `Error fetching task summary: ${error.message}`,
      };
    }
  }
  async updateCompletedTask(taskId: string) {
    try {
      const result = await this.subscriberProgressHistoryModel.findById(taskId);

      if (!result) {
        console.warn(`No document found for taskId: ${taskId}`);
        return;
      }

      const userProgress: any = await this.getOverallAchievement(
        result.userId.toString(),
      );

      if (!userProgress?.data?.completedTasks) {
        console.warn('No completedTasks data available.');
        return;
      }

      const currentTaskCompleted = result.taskCompleted || 0;

      if (currentTaskCompleted !== userProgress.data.completedTasks) {
        console.log(
          `Updating taskCompleted for ${taskId}:`,
          currentTaskCompleted,
          '->',
          userProgress.data.completedTasks,
        );

        // Perform the update and mark the source
        await this.subscriberProgressHistoryModel.findByIdAndUpdate(
          taskId,
          {
            $set: {
              taskCompleted: userProgress.data.completedTasks,
              source: 'updateCompletedTask', // Mark the source to prevent recursive triggers
            },
          },
          { new: true },
        );
      } else {
        console.log(`No change in taskCompleted for taskId: ${taskId}`);
      }
    } catch (error) {
      console.error(
        `Error in updateCompletedTask for taskId ${taskId}:`,
        error,
      );
    }
  }

  async updateCompletedAssessment(userId: string) {
    try {
      console.log(`Processing updates for userId: ${userId}`);

      // Fetch all assessment responses for the user
      const userProgress = await this.assessmentResponseModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId), // Match by userId
            isCalculated: true, // Only include calculated assessments
          },
        },
        {
          $group: {
            _id: null, // Group for total aggregation
            totalDocuments: { $sum: 1 }, // Count documents
            totalMarksSum: { $sum: '$totalMarks' }, // Sum total marks
            totalRightAnswers: { $sum: '$rightAnswer' }, // Sum correct answers
          },
        },
      ]);

      if (!userProgress.length) {
        console.warn(`No calculated assessments found for userId: ${userId}`);
        // return;
      }

      // Connect to the `userassessments` collection to fetch user data
      const client = new MongoClient(process.env.MONGO_URL);
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('userassessments');

      const userAssessments = await collection.findOne({ user_id: userId });
      const assessments = userAssessments?.assessments || [];

      // Filter assessments where `pending: "no"`
      const givenAssessments = assessments.filter(
        (assessment) => assessment.pending === 'no',
      );

      const givenAssessmentCount = givenAssessments.length;

      // Calculate total correct answers
      const totalCorrect = givenAssessments.reduce(
        (sum, assessment) => sum + (assessment.correct || 0),
        0,
      );

      // Calculate total questions (5 per assessment)
      const totalQuestions = givenAssessmentCount * 5;

      // Combine results
      const combinedTotalQuestions =
        totalQuestions + (userProgress[0]?.totalMarksSum || 0);
      const combinedCorrectAnswers =
        totalCorrect + (userProgress[0]?.totalRightAnswers || 0);
      const combinedAttempts =
        givenAssessmentCount + (userProgress[0]?.totalDocuments || 0);

      // Compute correctness percentage
      const correctnessPercentage =
        combinedTotalQuestions > 0
          ? (combinedCorrectAnswers / combinedTotalQuestions) * 100
          : 0;
      console.log({
        givenAssessmentCount,
        totalCorrect,
        totalQuestions,
        correctnessPercentage: `${correctnessPercentage.toFixed(2)}%`,
        combinedTotalQuestions,
        combinedCorrectAnswers,
        combinedAttempts,
      });
      // Update progress history
      console.log(typeof userId);
      await this.subscriberProgressHistoryModel.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(userId), // Match by userId
        },
        {
          totalAssessments: combinedAttempts,
          correctnessOfAnswers: correctnessPercentage,
        },
      );

      console.log('Updated user progress:', {
        totalAssessments: combinedAttempts,
        correctnessOfAnswers: correctnessPercentage.toFixed(2),
      });

      await client.close();
    } catch (error) {
      console.error(
        `Error updating completed assessment for userId: ${userId}`,
        error,
      );
    }
  }

  async getListOfSubscriberRank(
    levelId?: string,
    badgeId?: string,
    userId?: string,
    sortBy?: string,
    sortOrder?: string,
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      // Build the query for filters
      const query: any = {};

      if (levelId) {
        query.levelId = new mongoose.Types.ObjectId(levelId);
      }

      if (badgeId) {
        query.badgeId = new mongoose.Types.ObjectId(badgeId);
      }

      if (userId) {
        query.userId = new mongoose.Types.ObjectId(userId);
      }

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
        query.createdAt = dateCondition;
      }

      // Initialize pagination
      const skip = (page - 1) * limit;

      // Execute the query with filters and pagination
      const data = await this.subscriberProgressHistoryModel
        .find(query)
        .select('-subscriberHistory')
        .populate([
          {
            path: 'levelId',
            select: 'level',
          },
          {
            path: 'badgeId',
            select: 'badge',
          },
          {
            path: 'userId',
            select:
              'name phoneNo cadreId stateId districtId countryId blockId cadreType healthFacilityId',
            populate: [
              {
                path: 'cadreId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'stateId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'districtId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'blockId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'healthFacilityId', // Then populate the cadreId inside subscriber
                select: 'healthFacilityCode', // Select only the cadre name if needed
              },
            ],
          },
        ])
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }) // Default sort by createdAt in descending order
        .skip(skip) // Skip the number of documents to paginate
        .limit(limit); // Limit the number of documents to fetch

      // Get the total number of filtered records for pagination
      const totalSubscribers =
        await this.subscriberProgressHistoryModel.countDocuments(query);

      return this.baseResponse.sendResponse(
        200,
        message.subscriberActivity.SUBSCRIBER_ACTIVITY_LIST,
        {
          list: data,
          totalSubscribers,
          currentPage: +page,
          totalPages: Math.ceil(totalSubscribers / limit),
        },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getListOfSubscriberRankCsv(
    levelId?: string,
    badgeId?: string,
    userId?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    try {
      // Build the query for filters
      const query: any = {};

      if (levelId) {
        query.levelId = new mongoose.Types.ObjectId(levelId);
      }

      if (badgeId) {
        query.badgeId = new mongoose.Types.ObjectId(badgeId);
      }

      if (userId) {
        query.userId = new mongoose.Types.ObjectId(userId);
      }
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
        query.createdAt = dateCondition;
      }
      console.log('query---->', query);
      // Execute the query with filters and pagination
      const data = await this.subscriberProgressHistoryModel
        .find(query)
        .select('-subscriberHistory')
        .populate([
          {
            path: 'levelId',
            select: 'level',
          },
          {
            path: 'badgeId',
            select: 'badge',
          },
          {
            path: 'userId',
            select:
              'name phoneNo cadreId stateId districtId countryId blockId cadreType healthFacilityId',
            populate: [
              {
                path: 'cadreId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'stateId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'districtId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'blockId', // Then populate the cadreId inside subscriber
                select: 'title', // Select only the cadre name if needed
              },
              {
                path: 'healthFacilityId', // Then populate the cadreId inside subscriber
                select: 'healthFacilityCode', // Select only the cadre name if needed
              },
            ],
          },
        ])
        .sort({ createdAt: -1 })
        .exec(); // Default sort by createdAt in descending order
      console.log('data --->', data);
      return this.baseResponse.sendResponse(
        200,
        message.subscriberActivity.SUBSCRIBER_ACTIVITY_LIST,
        data,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
