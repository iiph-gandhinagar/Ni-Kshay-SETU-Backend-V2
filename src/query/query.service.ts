import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PopulateOptions, Types } from 'mongoose';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { NotificationQueueService } from 'src/common/utils/notificationQueueService';
import { InstituteDocument } from 'src/institute/entities/institute.entity';
import { MasterInstituteDocument } from 'src/master-institute/entities/master-institute.entity';
import { RoleDocument } from 'src/roles/entities/role.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { CreateQueryDto } from './dto/create-query.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { UpdateQueryDto } from './dto/update-query.dto';
import { QueryDocument } from './entities/query.entity';

@Injectable()
export class QueryService {
  constructor(
    @InjectModel('Query')
    private readonly queryModel: Model<QueryDocument>,
    @InjectModel('MasterInstitute')
    private readonly masterInstituteModel: Model<MasterInstituteDocument>,
    @InjectModel('Role')
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel('Institute')
    private readonly instituteModel: Model<InstituteDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FirebaseService))
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async create(createQueryDto: CreateQueryDto) {
    console.log('This action adds a new Query');
    createQueryDto.raisedBy = new mongoose.Types.ObjectId(
      createQueryDto.raisedBy,
    );
    createQueryDto.queryRaisedRole = new mongoose.Types.ObjectId(
      createQueryDto.queryRaisedRole,
    );
    createQueryDto.queryRaisedInstitute = new mongoose.Types.ObjectId(
      createQueryDto.queryRaisedInstitute,
    );

    const roleName = await this.roleModel
      .findById(createQueryDto.queryRaisedRole)
      .select('name');
    if (!roleName) {
      throw new HttpException(
        {
          message: 'Query Raised Role Issue!!',
          errors: 'bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const lastQuery = await this.queryModel
      .findOne({ queryId: { $regex: /^QC-(DRTB|NODAL)-\d{3}$/ } }) // Ensure the format is correct
      .sort({ createdAt: -1 }) // Sort by created at in descending order
      .lean();

    if (lastQuery) {
      // Extract the numeric part from the last queryId
      const lastQueryId = lastQuery.queryId;
      const lastNumber = parseInt(lastQueryId.split('-')[2], 10);

      // Increment the number
      const newNumber = lastNumber + 1;
      if (roleName.name === 'NODAL') {
        createQueryDto.queryId = `QC-NODAL-${newNumber.toString().padStart(3, '0')}`;
      } else if (roleName.name === 'DRTB') {
        createQueryDto.queryId = `QC-DRTB-${newNumber.toString().padStart(3, '0')}`;
      }
      // Format the new query ID (e.g., QC-DRTB-002)
    } else {
      // If there is no query ID yet, start with the first ID
      if (roleName.name === 'NODAL') {
        createQueryDto.queryId = `QC-NODAL-001`;
      } else if (roleName.name === 'DRTB') {
        createQueryDto.queryId = `QC-DRTB-001`;
      }
    }
    console.log('role name -->', roleName);

    const parentInstitute = await this.masterInstituteModel
      .findById(createQueryDto.queryRaisedInstitute)
      .select('parentId');
    if (!parentInstitute) {
      throw new HttpException(
        {
          message: 'Query Raised Institute Issue!!',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    createQueryDto.queryRespondedInstitute = new mongoose.Types.ObjectId(
      parentInstitute.parentId,
    );
    const newQuery = await this.queryModel.create(createQueryDto);
    /* Send Notification to institute subscribers */
    await this.query2CoeNotification(createQueryDto.queryRespondedInstitute);
    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_CREATED,
      newQuery,
    );
  }

  async queriesExport(paginationDto: PaginationDto, instituteId: string) {
    console.log(`This Action return queries report --> ${instituteId}`);
    const roleName = await this.masterInstituteModel
      .findById(instituteId)
      .populate({ path: 'role', select: 'name' })
      .lean(true);

    if (!roleName) {
      throw new HttpException('Institute not found', 400); // Check if the institute is not found
    }

    if (!roleName.role) {
      throw new HttpException('Role not found for this institute', 400); // Ensure role is populated
    }
    const name = (roleName.role as unknown as { name: string }).name;
    console.log('role name --->', name);
    let openQueries, closedQueries, transferQueries;
    let queryResults = {};
    if (paginationDto.type == 'RaisedInstitute') {
      openQueries = await this.openQueryList(instituteId);
      closedQueries = await this.closedQueryList(instituteId);
      queryResults = {
        openQueries: openQueries.data,
        closedQueries: closedQueries.data,
      };
    } else if (paginationDto.type == 'RespondedInstitute') {
      openQueries = await this.openQueryList(instituteId);
      closedQueries = await this.closedQueryList(instituteId);
      transferQueries = await this.transferQueryList(instituteId);
      queryResults = {
        openQueries: openQueries.data,
        closedQueries: closedQueries.data,
        transferQueries: transferQueries.data,
      };
    }
    console.log('modified Queries -->', queryResults);
    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      queryResults,
    );
  }

  async queriesReport(instituteId: string) {
    console.log(
      `This Action return Total Queries Report of an Institute ${instituteId}`,
    );
    const institute = await this.masterInstituteModel
      .findById(instituteId)
      .populate({ path: 'role', select: 'name' });
    const roleName = (institute.role as any)?.name;
    let totalQueries,
      closedQueries,
      openQueries,
      transferQueries,
      result,
      transferRespondedQueries;
    if (roleName === 'DRTB') {
      totalQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
        })
        .countDocuments();
      closedQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
        })
        .countDocuments();
      openQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
        })
        .countDocuments();
      transferQueries = 0;
      result = {
        totalQueries: totalQueries,
        closedQueries: closedQueries,
        openQueries: openQueries,
        transferQueries: transferQueries,
      };
    } else if (roleName === 'NODAL') {
      /* Institute Query Request List Counts */
      totalQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
        })
        .countDocuments();

      closedQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
        })
        .countDocuments();
      openQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
        })
        .countDocuments();

      /* Responded Queries List Counts */

      const totalQueriesResponded = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
        })
        .countDocuments();

      const closedQueriesResponded = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
        })
        .countDocuments();
      const openQueriesResponded = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
          status: 'In Progress',
        })
        .countDocuments();

      transferQueries = await this.queryModel
        .find({
          payload: {
            $elemMatch: {
              queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
              $or: [{ status: 'In Progress' }, { status: 'Query Transfer' }],
            },
          },
          $or: [
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .countDocuments();

      transferRespondedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          $or: [
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .countDocuments();
      result = {
        queryRaised: {
          totalQueries: totalQueries,
          closedQueries: closedQueries,
          openQueries: openQueries,
        },
        queryResponded: {
          totalQueriesResponded: totalQueriesResponded,
          closedQueriesResponded: closedQueriesResponded,
          openQueriesResponded: openQueriesResponded,
          transferQueries: transferQueries,
          transferRespondedQueries: transferRespondedQueries,
        },
      };
    } else {
      totalQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
        })
        .countDocuments();
      closedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
        })
        .countDocuments();
      openQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
          status: 'In Progress',
        })
        .countDocuments();
      transferQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          $or: [
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .countDocuments();
      result = {
        totalQueries: totalQueries,
        closedQueries: closedQueries,
        openQueries: openQueries,
        transferQueries: transferQueries,
      };
    }

    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      result,
    );
  }

  async queryHistory(queryId: string) {
    console.log(`Get Query History Details`);
    const queryHistory = await this.queryModel
      .findById(queryId)
      .select('payload');
    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      queryHistory,
    );
  }

  async closedQueryList(instituteId: string) {
    console.log(`This Action return all closed Queries of an Institute`);
    const institute = await this.masterInstituteModel
      .findById(instituteId)
      .populate({ path: 'role', select: 'name' });
    const roleName = (institute.role as any)?.name;
    let closedQueries, closedRespondedQueries;
    const modifiedQueries: {
      closedQueries?: any[];
      closedRespondedQueries?: any[];
    } = {};
    if (roleName === 'DRTB') {
      closedQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();
      modifiedQueries.closedQueries = closedQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
    } else if (roleName === 'NODAL') {
      closedQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();

      closedRespondedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();
      modifiedQueries.closedQueries = closedQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
      modifiedQueries.closedRespondedQueries = closedRespondedQueries.map(
        (query) => {
          // Use the delete operator to remove the payload field
          delete query.payload;
          return query;
        },
      );
    } else if (roleName === 'COE') {
      closedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: { $ne: null },
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();

      modifiedQueries.closedQueries = closedQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
    }

    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      modifiedQueries,
    );
  }

  async openQueryList(instituteId: string) {
    console.log(`This Action return all closed Queries of an Institute`);
    const institute = await this.masterInstituteModel
      .findById(instituteId)
      .populate({ path: 'role', select: 'name' });
    const roleName = (institute.role as any)?.name;
    let openQueries, openRespondedQueries;
    const modifiedQueries: {
      openQueries?: any[];
      openRespondedQueries?: any[];
    } = {};
    if (roleName === 'DRTB') {
      openQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();
      modifiedQueries.openQueries = openQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
    } else if (roleName === 'NODAL') {
      openQueries = await this.queryModel
        .find({
          queryRaisedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
          status: { $ne: 'Query Transfer' },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();

      openRespondedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
          status: { $ne: 'Query Transfer' },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();
      modifiedQueries.openQueries = openQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
      modifiedQueries.openRespondedQueries = openRespondedQueries.map(
        (query) => {
          // Use the delete operator to remove the payload field
          delete query.payload;
          return query;
        },
      );
    } else {
      openQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          response: null,
          payload: { $not: { $elemMatch: { status: 'Query Transfer' } } },
          status: { $ne: 'Query Transfer' },
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ createdAt: -1 })
        .lean();
      modifiedQueries.openQueries = openQueries.map((query) => {
        // Use the delete operator to remove the payload field
        delete query.payload;
        return query;
      });
    }

    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      modifiedQueries,
    );
  }

  async transferQueryList(instituteId: string) {
    console.log(
      `This Action return all transfer Queries of an Institute ${instituteId}`,
    );
    /* transferredQueries means query request from child 
    transferRespondedQueries means any institute is not able to answer and passed to another NODAL or COE institute ( i.e open Queries list? or after transfer query list?) */
    const institute = await this.masterInstituteModel
      .findById(instituteId)
      .populate({ path: 'role', select: 'name' });
    if (!institute) {
      throw new Error('Institute not found');
    }
    const roleName = (institute.role as any)?.name;
    let transferredQueries, transferRespondedQueries;
    const modifiedQueries: {
      transferQueries?: any[];
      transferRespondedQueries?: any[];
    } = {};
    if (roleName === 'NODAL') {
      transferredQueries = await this.queryModel
        .find({
          payload: {
            $elemMatch: {
              queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
              $or: [{ status: 'In Progress' }, { status: 'Query Transfer' }],
            },
          },
          $or: [
            // { payload: { $elemMatch: { status: 'In Progress' } } },
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ updatedAt: -1 })
        .lean();

      transferRespondedQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          $or: [
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ updatedAt: -1 })
        .lean();
      modifiedQueries.transferQueries = await Promise.all(
        transferredQueries.map(async (query) => {
          // Use the delete operator to remove the payload field
          const institute = await this.masterInstituteModel
            .findById(query.payload[0].queryRespondedInstitute)
            .select('title');

          query.transferInInstitute = {
            instituteId: query.payload[0].queryRespondedInstitute,
            instituteTitle: institute?.title, // Add optional chaining in case institute is not found
          };

          // Remove payload field
          delete query.payload;

          return query;
        }),
      );
      modifiedQueries.transferRespondedQueries = await Promise.all(
        transferRespondedQueries.map(async (query) => {
          // Fetch institute title asynchronously
          const institute = await this.masterInstituteModel
            .findById(query.payload[0].queryRespondedInstitute)
            .select('title');

          // Assign the institute details
          query.transferInInstitute = {
            instituteId: query.payload[0].queryRespondedInstitute,
            instituteTitle: institute?.title, // Optional chaining in case institute is not found
          };

          // Remove the payload field
          delete query.payload;

          return query;
        }),
      );
    } else {
      transferredQueries = await this.queryModel
        .find({
          queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
          $or: [
            { payload: { $elemMatch: { status: 'Query Transfer' } } },
            { status: { $eq: 'Query Transfer' } },
          ],
        })
        .populate([
          {
            path: 'raisedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedRole',
            select: 'name description',
          },
          {
            path: 'queryRespondedRole',
            select: 'name description',
          },
          {
            path: 'respondedBy',
            select: 'name phoneNo email',
          },
          {
            path: 'queryRaisedInstitute',
            select: 'title',
          },
          {
            path: 'queryRespondedInstitute',
            select: 'title',
          },
        ])
        .sort({ updatedAt: -1 })
        .lean();
      modifiedQueries.transferRespondedQueries = await Promise.all(
        transferredQueries.map(async (query) => {
          // Use the delete operator to remove the payload field
          const institute = await this.masterInstituteModel
            .findById(query.payload[0].queryRespondedInstitute)
            .select('title');

          query.transferInInstitute = {
            instituteId: query.payload[0].queryRespondedInstitute,
            instituteTitle: institute?.title, // Add optional chaining in case institute is not found
          };

          // Remove payload field
          delete query.payload;

          return query;
        }),
      );
    }

    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      modifiedQueries,
    );
  }

  async QueryHistoryOfSubscriber(paginationDto: PaginationDto) {
    console.log('This action returns all Subscriber Query');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'raisedBy', select: 'name' },
      { path: 'respondedBy', select: 'name' },
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.queryModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Query');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'raisedBy', select: 'name' },
      { path: 'respondedBy', select: 'name' },
      { path: 'queryRaisedRole', select: 'name' },
      { path: 'queryRespondedRole', select: 'name' },
      { path: 'queryRaisedInstitute', select: 'title' },
      { path: 'queryRespondedInstitute', select: 'title' },
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.queryModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async update(id: string, updateQueryDto: UpdateQueryDto) {
    console.log(`This action updates a #${id} Query`);
    const { ...otherFields } = updateQueryDto;
    /*  Need to update payload  --> (push into payload) */
    const result = await this.queryModel.findById(id).select('-payload');
    if (updateQueryDto.respondedBy) {
      otherFields.respondedBy = new mongoose.Types.ObjectId(
        updateQueryDto.respondedBy,
      );
    }
    if (updateQueryDto.queryRespondedRole) {
      otherFields.queryRespondedRole = new mongoose.Types.ObjectId(
        updateQueryDto.queryRespondedRole,
      );
    }
    if (updateQueryDto.queryRespondedInstitute) {
      otherFields.queryRespondedInstitute = new mongoose.Types.ObjectId(
        updateQueryDto.queryRespondedInstitute,
      );
    }
    if (updateQueryDto.response) {
      otherFields.status = 'completed';
      if (updateQueryDto.respondedBy) {
        await this.subscriberModel.findByIdAndUpdate(
          updateQueryDto.respondedBy,
          { $inc: { 'userContext.queryDetails.querySolved': 1 } },
          { new: true },
        );
      }
    }
    const updateDetails = await this.queryModel.findByIdAndUpdate(
      id, // Filter documents with IDs in the array
      {
        // Push the pushObject into the payload field
        $push: { payload: { $each: [result] } },

        // Set the new queryRespondedInstitute and queryRespondedRole
        ...otherFields,
      },
      { new: true }, // Optional: to return the updated documents
    );

    return this.baseResponse.sendResponse(
      200,
      message.institute.INSTITUTE_UPDATED,
      updateDetails,
    );
  }

  async transferQuery(
    transferQueryDto: TransferQueryDto,
    userId: any,
    type: string,
  ) {
    const { instituteId, questions } = transferQueryDto;
    const { _id, role } = userId;
    try {
      const instituteTitle = await this.masterInstituteModel
        .findById(instituteId)
        .select('title role');
      for (const item of questions) {
        const result = await this.queryModel.findById(item).select('-payload');

        let roleName;
        if (role !== 'subscriber') {
          roleName = await this.roleModel.findById(role);
        }

        console.log('roleName type-->', roleName, type);
        console.log(
          'if else condition-->',
          type === 'admin' &&
            (roleName.name.toLowerCase() === 'drtb' ||
              roleName.name.toLowerCase() === 'nodal' ||
              roleName.name.toLowerCase() === 'coe'),
        );
        let transferredBy, transferredByAdmin;
        if (type == 'admin' && roleName.name == 'Admin') {
          transferredByAdmin = _id;
        } else if (
          type === 'admin' &&
          (roleName.name.toLowerCase() === 'drtb' ||
            roleName.name.toLowerCase() === 'nodal' ||
            roleName.name.toLowerCase() === 'coe')
        ) {
          const subscriber = await this.instituteModel.findById(_id);
          transferredBy = subscriber.subscriber;
        } else if (type == 'subscriber') {
          transferredBy = _id;
        }
        console.log(
          'transferred By and transfradmin',
          transferredBy,
          transferredByAdmin,
        );
        // Update all documents matching the query IDs
        await this.queryModel.updateMany(
          { _id: { $in: [item] } }, // Filter documents with IDs in the array
          {
            // Push the pushObject into the payload field
            $push: { payload: { $each: [result] } },

            // Set the new queryRespondedInstitute and queryRespondedRole
            $set: {
              queryRespondedInstitute: new mongoose.Types.ObjectId(instituteId),
              queryRespondedRole: new mongoose.Types.ObjectId(
                instituteTitle.role,
              ), // Set the new queryRespondedRole
              transferredBy: transferredBy
                ? new mongoose.Types.ObjectId(transferredBy)
                : null,
              transferredByAdmin: transferredByAdmin
                ? new mongoose.Types.ObjectId(transferredByAdmin)
                : null,
              status: 'Query Transfer', // Set the new queryRespondedRole
            },
          },
          { new: true }, // Optional: to return the updated documents
        );
      }
      await this.query2CoeNotification(
        new mongoose.Types.ObjectId(instituteId),
      );
      return this.baseResponse.sendResponse(
        200,
        'Query Transfer Successfully!!',
        [],
      );
    } catch (error) {
      console.error('❌ Error in transfer Query:', error);
    }
  }

  async upFlowOfQuery() {
    console.log(
      `This Action returns all query whose Created date is >= 5 days`,
    );
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const queries = await this.queryModel.find({
      $or: [
        { updatedAt: { $gte: fiveDaysAgo } },
        { createdAt: { $gte: fiveDaysAgo } },
      ],
    });
    for (const item of queries) {
      const parentInstitute = await this.masterInstituteModel
        .findById(item.queryRespondedInstitute)
        .select('parentId');
      const roleOfParentId = await this.masterInstituteModel
        .findById(parentInstitute.parentId)
        .select('role');
      /*  Query History */
      const pushObject = [
        {
          query: item.query,
          response: item.response,
          raisedBy: item.raisedBy,
          respondedBy: item.respondedBy,
          queryRaisedRole: item.queryRaisedRole,
          queryRespondedRole: item.queryRespondedRole,
          queryRaisedInstitute: item.queryRaisedInstitute,
          queryRespondedInstitute: item.queryRespondedInstitute,
          status: item.status,
        },
      ];
      /*  Update payload and Institute role + new Institute */
      await this.queryModel.updateMany(
        { _id: { $in: [item._id] } }, // Filter documents with IDs in the array
        {
          // Push the pushObject into the payload field
          $push: { payload: { $each: pushObject } },

          // Set the new queryRespondedInstitute and queryRespondedRole
          $set: {
            queryRespondedInstitute: parentInstitute.parentId,
            queryRespondedRole: roleOfParentId.role, // Set the new queryRespondedRole
          },
        },
        { new: true }, // Optional: to return the updated documents
      );
      await this.query2CoeNotification(
        new mongoose.Types.ObjectId(parentInstitute.parentId),
      );
    }
  }

  async closeOldQueries() {
    console.log('Starting scheduler to close old queries...');

    // Calculate the date 7 days ago from now
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const queries = await this.queryModel.find({
        updatedAt: { $lte: sevenDaysAgo },
      });
      // Find and update queries whose updatedAt date is older than 7 days
      for (const item of queries) {
        const pushObject = [
          {
            query: item.query,
            response: item.response,
            raisedBy: item.raisedBy,
            respondedBy: item.respondedBy,
            queryRaisedRole: item.queryRaisedRole,
            queryRespondedRole: item.queryRespondedRole,
            queryRaisedInstitute: item.queryRaisedInstitute,
            queryRespondedInstitute: item.queryRespondedInstitute,
            status: item.status,
          },
        ];
        /*  Update payload and Institute role + new Institute */
        await this.queryModel.updateMany(
          { _id: { $in: [item._id] } }, // Filter documents with IDs in the array
          {
            // Push the pushObject into the payload field
            $push: { payload: { $each: pushObject } },

            // Set the new queryRespondedInstitute and queryRespondedRole
            $set: {
              status: 'completed',
            },
          },
          { new: true }, // Optional: to return the updated documents
        );
      }
    } catch (error) {
      console.error('❌ Error closing old queries', error);
    }
  }

  async query2CoeNotification(instituteId: Types.ObjectId) {
    /* Scheduler --- */
    console.log(`This action send notification to institute's subscribers`);
    const subscriber = await this.subscriberModel
      .find({
        'userContext.queryDetails.instituteId': new mongoose.Types.ObjectId(
          instituteId,
        ),
      })
      .select('name');
    const userIds = subscriber.map((item) => item._id);
    const deviceToken = await this.userDeviceTokenModel
      .find({
        userId: { $in: userIds },
      })
      .select('notificationToken');
    const title = 'New Query Raised';
    const description = `You have a new pending query in your account. Please review and address it at your earliest convenience.`;
    const notification = {
      title: title,
      description: description,
      link: `${process.env.FRONTEND_URL}/QRMScreen`,
      automaticNotificationType: 'Query 2 COE',
      userId: userIds,
      createdBy: new mongoose.Types.ObjectId('6666862ab0734aac9db93a9d'), //change to super admin
      status: 'Pending',
      isDeepLink: true,
      typeTitle: 'Query2Coe',
      type: 'Automatic Notification',
    };
    const notificationData =
      await this.userNotificationModel.create(notification);

    this.notificationQueueService.addNotificationToQueue(
      notificationData._id.toString(),
      notification,
      deviceToken,
      'query2coe',
    );
  }

  async queryReport(paginationDto: PaginationDto) {
    console.log(`This Action returns query Report!`);
    console.log('paginationDto-->', paginationDto);
    const query = await this.filterService.filter(paginationDto);
    const subscriberActivity = [
      { $match: query },
      {
        $lookup: {
          from: 'subscribers',
          localField: 'raisedBy',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, phoneNo: 1 } }, // Include only `name`,`phoneNo` and `email` fields
          ],
          as: 'raisedBy',
        },
      },
      {
        $lookup: {
          from: 'subscribers',
          localField: 'respondedBy',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, phoneNo: 1 } }, // Include only `name`,`phoneNo` and `email` fields
          ],
          as: 'respondedBy',
        },
      },
      {
        $lookup: {
          from: 'Role',
          localField: 'queryRaisedRole',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1 } }, // Include only `name` field
          ],
          as: 'queryRaisedRole',
        },
      },
      {
        $lookup: {
          from: 'Role',
          localField: 'queryRespondedRole',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1 } }, // Include only `name` fields
          ],
          as: 'queryRespondedRole',
        },
      },
      {
        $lookup: {
          from: 'MasterInstitute',
          localField: 'queryRaisedInstitute',
          foreignField: '_id',
          pipeline: [
            { $project: { title: 1 } }, // Include only `title` field
          ],
          as: 'queryRaisedInstitute',
        },
      },
      {
        $lookup: {
          from: 'MasterInstitute',
          localField: 'queryRespondedInstitute',
          foreignField: '_id',
          pipeline: [
            { $project: { title: 1 } }, // Include only `title` field
          ],
          as: 'queryRespondedInstitute',
        },
      },
      {
        $lookup: {
          from: 'AdminUser',
          localField: 'transferredByAdmin',
          foreignField: '_id',
          pipeline: [
            { $project: { title: 1 } }, // Include only `title` field
          ],
          as: 'transferredByAdmin',
        },
      },
      {
        $lookup: {
          from: 'Subscriber',
          localField: 'transferredBy',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, phoneNo: 1 } }, // Include only `name`,`phoneNo` and `email` fields
          ],
          as: 'transferredBy',
        },
      },
      {
        $project: {
          age: 1,
          diagnosis: 1,
          dateOfAdmission: 1,
          chiefComplaint: 1,
          illness: 1,
          pastHistory: 1,
          preTreatmentEvaluation: 1,
          assessmentAndDiffDiagnosis: 1,
          currentTreatmentPlan: 1,
          query: 1,
          queryId: 1,
          response: 1,
          status: 1,
          raisedBy: 1,
          respondedBy: 1,
          queryRaisedRole: 1,
          queryRespondedRole: 1,
          queryRaisedInstitute: 1,
          queryRespondedInstitute: 1,
          transferredByAdmin: 1,
          transferredBy: 1,
        },
      },
    ];
    const result = await this.queryModel.aggregate(subscriberActivity).exec();
    return this.baseResponse.sendResponse(
      200,
      message.query.QUERY_LIST,
      result,
    );
  }
}
