import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import csvParser from 'csv-parser';
import { stringify } from 'csv-stringify';
import * as dotenv from 'dotenv';
import moment from 'moment';
import { MongoClient } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrimaryCadreDocument } from 'src/primary-cadre/entities/primary-cadre.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { PassThrough } from 'stream';
import { ReadContentDto } from './dto/create-kbase-history.dto';
import { CreateKbaseDto } from './dto/create-kbase.dto';
import { KbaseDocument } from './entities/kbase.entity';
import { KbaseUserHistoryDocument } from './entities/kbaseHistory.entity';
dotenv.config();

@Injectable()
export class KbaseService {
  constructor(
    @InjectModel('Kbase')
    private readonly kbaseModel: Model<KbaseDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('PrimaryCadre')
    private readonly primaryCadreModel: Model<PrimaryCadreDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @InjectModel('KbaseUserHistory')
    private readonly userKbaseHistoryModel: Model<KbaseUserHistoryDocument>,
    @InjectModel('subscriberProgressHistory')
    private readonly subscriberProgressHistoryModel: Model<SubscriberProgressHistoryDocument>,
  ) {}
  create(createKbaseDto: CreateKbaseDto) {
    return `This action adds a new kbase ${createKbaseDto}`;
  }

  async getCourse(id: string, courseTitle: string) {
    console.log(`This action returns all kbase: ${id}`);
    const userCadre = await this.subscriberModel.findById(id).select('cadreId');
    if (!userCadre) {
      throw new HttpException(
        {
          message: 'User not found!',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const primaryCadre = await this.cadreModel
      .findById(userCadre.cadreId)
      .select('cadreGroup')
      .lean(true);
    if (primaryCadre.cadreGroup === null) {
      throw new HttpException(
        {
          message: 'course not found!',
          errors: 'No cadre Course Found!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const cadreGroupName = await this.primaryCadreModel
      .findById(primaryCadre.cadreGroup)
      .select('title')
      .lean();
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('kmap_batch_registry');
      const registryId = await collection
        .find({ is_active: true })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
        .limit(1) // Limit to only one result
        .toArray();
      const kbaseCourse = await this.kbaseModel
        .find({
          courseTitle: new RegExp(courseTitle, 'i'),
          registry_id: registryId[0]._id,
          cadreTitle: { $in: [cadreGroupName.title] },
        })
        .select('courseId courseTitle');
      return this.baseResponse.sendResponse(
        200,
        message.kbase.KBASE_COURSE_LIST,
        kbaseCourse,
      );
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async getModuleWithChapter(id: string) {
    console.log(`This action returns kbase course of userId: ${id}`);

    /*  Subscriber Cadre Details ---------*/
    const userCadre = await this.subscriberModel
      .findById(id)
      .select('cadreId')
      .lean();
    if (!userCadre) {
      console.log('No subscriber found with the given ID');
      return this.baseResponse.sendError(401, 'No user Found', []); // Handle the case where no document is found
    }

    /* Primary Cadre id fetch ----------- */
    const primaryCadre = await this.cadreModel
      .findById(userCadre.cadreId)
      .select('cadreGroup')
      .lean();

    /* Get Primary Cadre Details --------- */
    const cadreGroupName = await this.primaryCadreModel
      .findById(primaryCadre.cadreGroup)
      .select('title')
      .lean();

    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('kmap_batch_registry');
      const registryId = await collection
        .find({ is_active: true })
        .sort({ created_at: -1 }) // Sort by createdAt in descending order (newest first)
        .limit(1) // Limit to only one result
        .toArray();
      const kbaseCourse = await this.kbaseModel
        .findOne({
          registry_id: registryId[0]._id,
          cadreTitle: { $in: [cadreGroupName.title] },
        })
        .select('courseId courseTitle _id');
      const course = await this.kbaseModel
        .findOne({ _id: kbaseCourse._id })
        .select('courseTitle module.moduleTitle')
        .exec();
      return this.baseResponse.sendResponse(
        200,
        message.kbase.KBASE_MODULE_WITH_CHAPTER_LIST,
        course,
      );
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async getChapterWithContentPage(courseId: string, userId: string) {
    let updatedModules;
    let totalReadModules;
    const kbaseData = await this.kbaseModel
      .findById(new mongoose.Types.ObjectId(courseId))
      .select('module totalModule courseId')
      .lean()
      .exec();
    const userKbaseHistories = await this.userKbaseHistoryModel
      .aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            audienceId: kbaseData.courseId,
          },
        },
        {
          $unwind: '$moduleHistory',
        },
        {
          $group: {
            _id: {
              courseTitle: '$courseTitle',
              moduleId: '$moduleHistory.moduleId',
            },
            histories: {
              $push: {
                chapterId: '$moduleHistory.chapterId',
                readContentIds: '$moduleHistory.readContentIds',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            courseTitle: '$_id.courseTitle',
            moduleId: '$_id.moduleId',
            histories: 1,
          },
        },
      ])
      .exec();

    if (userKbaseHistories) {
      updatedModules = await this.updateReadContentStatus(
        kbaseData.module,
        userKbaseHistories,
      );

      totalReadModules = updatedModules.filter(
        (module) => module.isModuleRead,
      ).length;
    } else {
      updatedModules = kbaseData;
    }

    const KbaseProgress = (totalReadModules * 100) / kbaseData.totalModule;

    console.log(userId, '--userId');
    await this.subscriberProgressHistoryModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        $or: [
          { kbaseCompletion: { $exists: false } }, // Field does not exist
          { kbaseCompletion: { $exists: true } }, // Field exists, update
        ],
      },
      {
        $set: { kbaseCompletion: KbaseProgress },
      },
    );
    return this.baseResponse.sendResponse(
      200,
      message.kbase.KBASE_MODULE_WITH_CHAPTER_LIST,
      {
        module: updatedModules,
        totalModule: kbaseData.totalModule,
        totalReadModule: totalReadModules || 0,
      },
    );
  }
  updateReadContentStatus = async (
    modules: any[],
    userReadModuleHistory: any[],
  ) => {
    return modules.map((module) => {
      const moduleHistory = userReadModuleHistory.find(
        (history) => history.moduleId === module.moduleId,
      );

      if (!moduleHistory) return { ...module, isModuleRead: false };

      const updatedChapters = module.chapter.map((chapter) => {
        const chapterHistory = moduleHistory.histories.find(
          (history) => history.chapterId === chapter.chapterId,
        );

        if (!chapterHistory) return { ...chapter, isChapterRead: false };

        const updatedContentPages = chapter.contentPage.map((content) => ({
          ...content,
          isReadContent:
            content.contentId &&
            chapterHistory.readContentIds.includes(content.contentId)
              ? true
              : undefined,
        }));

        const isChapterRead = updatedContentPages.every(
          (content) => content.contentId === '' || content.isReadContent,
        );

        return {
          ...chapter,
          contentPage: updatedContentPages,
          isChapterRead,
        };
      });

      const isModuleRead = updatedChapters.every(
        (chapter) => chapter.isChapterRead,
      );

      return {
        ...module,
        chapter: updatedChapters,
        isModuleRead,
      };
    });
  };
  async fetchCourseData() {
    try {
      const apiUrl = process.env.COURSE_NTEP_API;
      const { data } = await axios.get(apiUrl, {
        auth: {
          username: process.env.NTEP_CRED,
          password: process.env.NTEP_CRED,
        },
      });
      return data;
    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      throw error;
    }
  }

  async scriptForStructureData() {
    console.log(
      `This action is read csv data and make structure data form kbase-extract `,
    );
    /*  Get All Course Data ----------------------------------------- */

    try {
      await this.kbaseModel.deleteMany({});
      const courseData = await this.fetchCourseData();

      /*  Filter Course Data From All Data ---------------------------------------------------- */
      const filteredCourses = courseData.filter(
        (item) => item.field_grouptype === 'Course',
      );
      /* All Course Loop ----------------------------------------------------------------- */
      for (const item of filteredCourses) {
        console.log('item--->', item);

        const { targetAudience, cadres } = await this.cadreMapping(item);
        const result = {
          courseTitle: item.title,
          courseId: item.nid,
          cadreId: targetAudience,
          cadreTitle: cadres.map((module) => module.name),
          module: [],
          totalModule: 0,
          totalChapter: 0,
          totalContent: 0,
        };

        /* Get Modules Data Of Course ------------------------------------------------------ */
        const { contentIds, modules } = await this.findIdsAndData(
          item,
          courseData,
        );
        result.totalModule = contentIds;
        /* Get All chapters of Modules ----------------------------------------------------- */
        for (const record of modules) {
          const newModule = {
            moduleTitle: record.title,
            moduleId: record.nid,
            chapter: [], // Initialize chapters as an empty array
          };
          result.module.push(newModule);
          const { contentIds: fieldIds, modules: chapter } =
            await this.findIdsAndData(record, courseData);
          result.totalChapter += fieldIds;

          /*  Get All Content Page Details of Chapters ----------------------------------------------*/
          for (const data of chapter) {
            const chapterDetails = {
              chapterTitle: data.title,
              chapterId: data.nid,
              contentPage: [],
            };

            newModule.chapter.push(chapterDetails);
            const fieldIds = data.field_content
              .split(',')
              .map((id) => id.trim());
            result.totalContent += fieldIds.length;
            console.log('content ids of chapter ---->', fieldIds);
            /*  Get all H5pId data and content page title -------------------------------------------------------------- */
            for (const contentId of fieldIds) {
              const contentPage = await this.processContentPageId(contentId);
              // After receiving the contentPage, push it to the chapterDetails in the correct order
              if (contentPage) {
                chapterDetails.contentPage.push(contentPage);
              }
            }
          }
        }

        await new this.kbaseModel(result).save();
      }
    } catch (error) {
      console.error(
        '❌ Error Course Get API: --',
        error.response ? error.response.data : error.message,
      );
      throw new HttpException(
        {
          message: error.response ? error.response.data : error.message,
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cadreMapping(item) {
    const url = process.env.CADRE_MAPPING_API;
    const cadreDta = (await axios.get(url)).data;
    const targetAudience = item.field_target_audience
      .split(',')
      .map((id) => id.trim());
    const cadres = cadreDta.filter((module) =>
      targetAudience.includes(module.tid.trim()),
    );
    return {
      targetAudience: targetAudience,
      cadres: cadres,
    };
  }
  async findIdsAndData(item, courseData) {
    const contentIds = item.field_content.split(',').map((id) => id.trim());

    const modules = contentIds
      .map((contentId) =>
        courseData.find((module) => module.nid.trim() === contentId),
      )
      .filter(Boolean);
    return { contentIds: contentIds.length, modules: modules };
  }
  async processContentPageId(contentId) {
    try {
      // Replace with your actual API endpoint
      const url = `${process.env.NTEP_URL}nid=${contentId}&langcode=en`;
      const apiResponse = (await axios.get(url)).data;

      // Add fetched data to the contentPage array of the current chapter
      return {
        contentTitle: apiResponse[0]?.title || '',
        contentId: apiResponse[0]?.nid || '',
        h5pIds: apiResponse[0]?.['H5P-id'] || [],
      };
    } catch (error) {
      console.error(
        `❌ Error fetching content details for ID ${contentId}:`,
        error,
      );
    }
  }

  async fetchAndParseCsv(url: string): Promise<any[]> {
    try {
      // Fetch the CSV file
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      // Create a PassThrough stream to pipe the response
      const csvStream = response.data.pipe(new PassThrough());

      // Parse CSV data
      return new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        csvStream
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      throw new Error(`Failed to fetch and parse CSV: ${error.message}`);
    }
  }
  async addReadContent(userId, readContentDto: ReadContentDto) {
    try {
      console.log({ userId, readContentDto });
      const { courseId, moduleId, chapterId, contentId } = readContentDto;
      const audience = await this.kbaseModel
        .findById(courseId)
        .select('courseId');
      console.log('audience id -->', audience.courseId);
      const moduleHistoryEntry = await this.userKbaseHistoryModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        audienceId: audience.courseId,
        // courseId: new mongoose.Types.ObjectId(courseId),
        'moduleHistory.moduleId': moduleId,
        'moduleHistory.chapterId': chapterId,
      });
      console.log(moduleHistoryEntry, '----------------moduleHistoryEntry');

      if (moduleHistoryEntry) {
        // Find user history
        const userHistory = await this.userKbaseHistoryModel.findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(userId),
            audienceId: audience.courseId,
            'moduleHistory.moduleId': moduleId,
            'moduleHistory.chapterId': chapterId,
          },
          {
            $addToSet: {
              'moduleHistory.$.readContentIds': contentId,
            },
          },
          {
            new: true,
            upsert: true,
          },
        );

        // Check if moduleHistory entry was updated
        return this.baseResponse.sendResponse(
          200,
          message.kbase.KBASE_HISTORY_ADDED,
          userHistory,
        );
      } else {
        // If moduleHistory entry does not exist, create and push a new entry
        const newUserHistory = await this.userKbaseHistoryModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          audienceId: audience.courseId,
          courseId: new mongoose.Types.ObjectId(courseId),
          moduleHistory: [
            {
              moduleId,
              chapterId,
              readContentIds: [contentId],
            },
          ],
        });
        // Save updated user history
        return this.baseResponse.sendResponse(
          200,
          message.kbase.KBASE_HISTORY_ADDED,
          newUserHistory,
        );
      }
    } catch (error) {
      throw new Error(
        `❌ Failed In kbase History Fetch data: ${error.message}`,
      );
    }
  }

  async kbaseCourseReport(paginationDto: PaginationDto) {
    console.log(`This Report Return kbase course list`);
    const query: any = {};
    const { sortBy, sortOrder, courseTitle, cadreIds } = paginationDto;
    if (courseTitle) {
      query.courseTitle = new RegExp(courseTitle, 'i');
    }
    if (cadreIds) {
      query.cadreTitle = { $in: cadreIds };
    }
    const client = new MongoClient(process.env.MONGO_URL);
    try {
      await client.connect();
      const db = client.db('ns-rewamp-backend');
      const collection = db.collection('kmap_batch_registry');
      const registryId = await collection
        .find({ is_active: true })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
        .limit(1) // Limit to only one result
        .toArray();
      const kbaseCourse = await this.kbaseModel
        .find({
          registry_id: registryId[0]._id,
          ...query,
        })
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .select(
          'courseTitle courseId cadreId cadreTitle totalModule totalChapter totalContent createdAt updatedAt',
        );
      const results = await Promise.all(
        kbaseCourse.map(async (course) => {
          const primaryCadres = await this.primaryCadreModel
            .find({ audienceId: { $in: course.cadreId } })
            .select('_id');
          const primaryCadreIds = primaryCadres.map((cadre) => cadre._id);

          if (!primaryCadreIds.length) {
            return { ...course.toObject(), userCount: 0 };
          }

          const cadres = await this.cadreModel
            .find({ cadreGroup: { $in: primaryCadreIds } })
            .select('_id');
          const cadreIds = cadres.map((cadre) => cadre._id);

          if (!cadreIds.length) {
            return { ...course.toObject(), userCount: 0 };
          }

          const subscribers = await this.subscriberModel.countDocuments({
            cadreId: { $in: cadreIds },
          });

          return { ...course.toObject(), userCount: subscribers };
        }),
      );

      return this.baseResponse.sendResponse(
        200,
        'kbase Course Details!!',
        results,
      );
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      // Ensure the client is closed whether or not an error occurs
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  async generateCsv(data: any[], columns: any): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true, // Include column headers
          columns: columns,
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

  async kbaseReport(paginationDto: PaginationDto) {
    const {
      sortOrder,
      sortBy,
      limit,
      page,
      country,
      stateIds,
      districtIds,
      userCadreId,
      courseTitle,
    } = paginationDto;
    const query = await this.filterService.filter(paginationDto);
    console.log('query---->', query);
    const aggregation: any[] = [
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      { $match: query },
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
          pipeline:
            stateIds && stateIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: stateIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'userId.cadreId',
          foreignField: '_id',
          as: 'userId.cadre',
          pipeline:
            userCadreId && userCadreId.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: userCadreId.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'userId.districtId',
          foreignField: '_id',
          as: 'userId.district',
          pipeline:
            districtIds && districtIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: districtIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $group: {
          _id: '$userId', // Group by userId
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userData: {
            name: 1,
            phoneNo: 1,
            email: 1,
            country: 1,
            state: 1,
            cadreType: 1,
            cadre: 1,
            district: 1,
          },
          createdAt: 1,
          activities: 1, // All activities related to this user
        },
      },
    ];
    aggregation.push(
      {
        $facet: {
          totalItems: [{ $count: 'count' }],
          data: [
            { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
            { $skip: Number(limit) * (Number(page) - 1) },
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          totalItems: { $arrayElemAt: ['$totalItems.count', 0] },
          data: 1,
        },
      },
    );
    const userIds = await this.userKbaseHistoryModel
      .aggregate(aggregation)
      .exec();

    // Step 4: Process each user ID in the current page
    console.log('userIds--->', userIds?.[0]);
    const userIdList = userIds[0]?.data.map((item) => item.userId._id) || [];
    console.log('userIdList', userIdList);
    const [lastAccessDates, totalTimes] = await Promise.all([
      this.subscriberActivityModel
        .find({
          userId: { $in: userIdList },
          module: new RegExp('Knowledge Connect', 'i'),
        })
        .sort({ createdAt: -1 })
        .lean(true),
      this.subscriberActivityModel
        .find({
          userId: { $in: userIdList },
          module: new RegExp('Knowledge Connect', 'i'),
        })
        .select('timeSpent userId'),
    ]);
    const totalTimeMap = new Map(
      totalTimes.map((t) => [t._id.toString(), t.totalTime]),
    );
    const results = await Promise.all(
      userIds[0].data.map(async (item) => {
        const userIdStr = item.userId._id.toString();
        console.log('userIdStr---->', item, item.userId.cadreId);
        const userLastAccess = lastAccessDates.find(
          (access) => access.userId.toString() === userIdStr,
        );
        const userTotalTime = totalTimeMap.get(userIdStr) || 0;

        const course = await this.getCourse(userIdStr, courseTitle);
        if (course.code === 400 || course.data.length === 0) return null;

        const result = await this.getChapterWithContentPage(
          course.data[0]._id,
          userIdStr,
        );
        const primaryCadre = await this.cadreModel
          .find({ _id: item.userId.cadreId })
          .populate({ path: 'cadreGroup', select: 'title' })
          .select('cadreGroup')
          .lean();

        return {
          userId: await this.subscriberModel
            .findById(item.userId._id)
            .populate({ path: 'cadreId', select: 'title' })
            .populate({ path: 'stateId', select: 'title' })
            .populate({ path: 'districtId', select: 'title' })
            .select('email phoneNo cadreId cadreType name stateId districtId'),
          primaryCadre,
          course: course.data[0],
          totalModule: result.data.totalModule,
          totalReadModule: result.data.totalReadModule,
          percentage: Math.round(
            (result.data.totalReadModule / result.data.totalModule) * 100,
          ),
          lastAccessDate: (userLastAccess as any)?.createdAt || '',
          totalTime: userTotalTime,
        };
      }),
    );

    // Filter out null results (users without valid courses)
    const finalResults = results.filter((r) => r !== null);

    // Step 4: Prepare Final Payload
    const totalItems = userIds?.[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const payload = {
      list: finalResults,
      currentPage: page,
      totalPages,
      totalItems,
    };

    return this.baseResponse.sendResponse(
      200,
      message.kbase.KBASE_REPORT_LIST,
      payload,
    );
  }

  async kbaseReportCsv(paginationDto: PaginationDto) {
    console.log(
      `This Action returns kbase report csv based on paginationDto: ${paginationDto}`,
    );
    const {
      country,
      stateIds,
      districtIds,
      userCadreId,
      blockIds,
      healthFacilityIds,
      courseTitle,
    } = paginationDto;
    const query = await this.filterService.filter(paginationDto);
    const aggregation: any[] = [
      {
        $lookup: {
          from: 'subscribers',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
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
          pipeline:
            stateIds && stateIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: stateIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'cadres',
          localField: 'userId.cadreId',
          foreignField: '_id',
          as: 'userId.cadre',
          pipeline:
            userCadreId && userCadreId.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: userCadreId.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'districts',
          localField: 'userId.districtId',
          foreignField: '_id',
          as: 'userId.district',
          pipeline:
            districtIds && districtIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: districtIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'blocks',
          localField: 'userId.blockId',
          foreignField: '_id',
          as: 'userId.block',
          pipeline:
            blockIds && blockIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: blockIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      {
        $lookup: {
          from: 'healthfacilities',
          localField: 'userId.healthFacilityId',
          foreignField: '_id',
          as: 'userId.healthFacility',
          pipeline:
            healthFacilityIds && healthFacilityIds.length > 0
              ? [
                  {
                    $match: {
                      _id: {
                        $in: healthFacilityIds.map(
                          (s) => new mongoose.Types.ObjectId(s),
                        ),
                      },
                    },
                  },
                ]
              : [],
        },
      },
      { $match: query },
      {
        $group: {
          _id: '$userId', // Group by userId
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userData: {
            name: 1,
            phoneNo: 1,
            email: 1,
            country: 1,
            state: 1,
            cadreType: 1,
            cadre: 1,
            district: 1,
            block: 1,
            healthFacility: 1,
          },
          createdAt: 1,
          activities: 1, // All activities related to this user
        },
      },
    ];
    const result = await this.userKbaseHistoryModel
      .aggregate(aggregation)
      .exec();
    //
    // Step 4: Process each user ID in the current page
    const results = [];
    for (const item of result) {
      const lastAccessDate = await this.subscriberActivityModel
        .findOne({
          userId: item.userId._id,
          module: new RegExp('Knowledge Connect', 'i'),
        })
        .sort({ createdAt: -1 })
        .lean(true);
      const totalTime = await this.subscriberActivityModel
        .find({
          userId: item.userId._id,
          module: new RegExp('Knowledge Connect', 'i'),
        })
        .select('timeSpent');
      const course = await this.getCourse(
        item.userId._id.toString(),
        courseTitle,
      );
      if (course.code !== 400 && course.data.length > 0) {
        const result = await this.getChapterWithContentPage(
          course.data[0]._id,
          item.userId._id.toString(),
        );
        const userId = await this.subscriberModel
          .findById(item.userId._id)
          .populate({ path: 'cadreId', select: 'title' })
          .select('email phoneNo cadreId cadreType name');
        // Store the processed result
        results.push({
          userId: await this.subscriberModel
            .findById(item.userId._id)
            .populate({ path: 'cadreId', select: 'title' })
            .populate({ path: 'stateId', select: 'title' })
            .populate({ path: 'districtId', select: 'title' })
            .populate({ path: 'blockId', select: 'title' })
            .populate({
              path: 'healthFacilityId',
              select: 'healthFacilityCode',
            })
            .select(
              'email phoneNo cadreId cadreType name stateId districtId blockId healthFacilityId',
            ),
          primaryCadre: await this.cadreModel
            .find({ _id: userId.cadreId })
            .populate({ path: 'cadreGroup', select: 'title' })
            .select('cadreGroup'),
          course: course.data[0],
          totalModule: result.data.totalModule,
          totalReadModule: result.data.totalReadModule,
          percentage: Math.round(
            (result.data.totalReadModule / result.data.totalModule) * 100,
          ),
          lastAccessDate: lastAccessDate
            ? moment((lastAccessDate as any).createdAt).format(
                'YYYY-MM-DD HH:mm:ss',
              )
            : '',
          totalTime: totalTime.reduce(
            (total, record) => total + (record.timeSpent || 0),
            0,
          ),
        });
      }
    }
    // Step 5: Return paginated results
    return this.baseResponse.sendResponse(
      200,
      message.kbase.KBASE_REPORT_LIST,
      results,
    );
  }
}
