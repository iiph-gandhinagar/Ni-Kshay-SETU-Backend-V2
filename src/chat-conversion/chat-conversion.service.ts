import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { stringify } from 'csv-stringify';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';
import { message } from 'src/common/assets/message.asset';
import { ChatConversionAggregation } from 'src/common/pagination/chatConversionAggregation.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { UpdateChatConversionDto } from './dto/update-chat-conversion.dto';
import { ChatConversionDocument } from './entities/chat-conversion.entity';

@Injectable()
export class ChatConversionService {
  constructor(
    @InjectModel('ChatConversion')
    private readonly chatConversionModel: Model<ChatConversionDocument>,
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
  ) {}

  async findOne(searchField: string, value: string) {
    console.log(`This action returns a chat history details`);
    const getChatConversionById = await this.chatConversionModel
      .findOne({ [searchField]: value })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.chatConversion.CHAT_CONVERSION_LIST,
      getChatConversionById,
    );
  }

  async findById(sessionId: string) {
    console.log(
      `This action returns a chat history details based on sessionId`,
    );
    const getChatConversionById = await this.chatConversionModel
      .findOne({ sessionId: sessionId })
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.chatConversion.CHAT_CONVERSION_LIST,
      getChatConversionById,
    );
  }

  async chatHistoriesForAdmin(paginationDto: PaginationDto, userId: string) {
    console.log(`This Action return all chat history!`);
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
    return await ChatConversionAggregation(
      this.chatConversionModel,
      paginationDto,
      query,
    );
  }

  async chatHistoryCsv(paginationDto: PaginationDto, userId: string) {
    console.log(`This action returns csv of chat history details`);
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
    const aggregatePipeline = await this.chatConversionModel
      .aggregate([
        {
          $lookup: {
            from: 'subscribers', // Assuming 'users' is the collection for user details
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: {
            path: '$userId',
            preserveNullAndEmptyArrays: true, // Optional: Keeps documents even if no match is found
          },
        },
        {
          $lookup: {
            from: 'cadres', // Assuming 'cadres' is the collection for cadre details
            localField: 'userId.cadreId',
            foreignField: '_id',
            as: 'userId.cadreDetails',
          },
        },
        {
          $lookup: {
            from: 'countries', // Assuming 'countries' is the collection for country details
            localField: 'userId.countryId',
            foreignField: '_id',
            as: 'userId.countryDetails',
          },
        },
        {
          $lookup: {
            from: 'states', // Assuming 'states' is the collection for state details
            localField: 'userId.stateId',
            foreignField: '_id',
            as: 'userId.stateDetails',
          },
        },
        {
          $lookup: {
            from: 'districts', // Assuming 'districts' is the collection for district details
            localField: 'userId.districtId',
            foreignField: '_id',
            as: 'userId.districtDetails',
          },
        },
        {
          $lookup: {
            from: 'blocks', // Assuming 'blocks' is the collection for block details
            localField: 'userId.blockId',
            foreignField: '_id',
            as: 'userId.blockDetails',
          },
        },
        {
          $lookup: {
            from: 'healthfacilities', // Assuming 'healthfacilities' is the collection for health facility details
            localField: 'userId.healthFacilityId',
            foreignField: '_id',
            as: 'userId.healthFacilityDetails',
          },
        },
        { $match: query },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            message: 1,
            sessionId: 1,
            'userId.name': 1,
            'userId.phoneNo': 1,
            'userId.email': 1,
            'userId.cadreDetails.title': 1,
            'userId.countryDetails.title': 1,
            'userId.stateDetails.title': 1,
            'userId.districtDetails.title': 1,
            'userId.blockDetails.title': 1,
            'userId.healthFacilityDetails.healthFacilityCode': 1,
            createdAt: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M:%S', // Custom date format
                date: {
                  $toDate: {
                    $arrayElemAt: ['$message.createdAt', 0], // Extract first message's createdAt
                  },
                },
                timezone: 'Asia/Kolkata',
              },
            },
          },
        },
      ])
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.chatConversion.CHAT_CONVERSION_LIST,
      aggregatePipeline,
    );
  }

  async chatHistory(paginationDto: PaginationDto, userId: string) {
    console.log(`This Action return all chat history!`);
    paginationDto.userId = userId;
    const statePopulateOptions: PopulateOptions[] = [
      {
        path: 'userId',
        select:
          'name phoneNo email cadreId countryId stateId districtId blockId healthFacilityId',
        populate: [
          {
            path: 'cadreId',
            select: 'title',
          },
          {
            path: 'countryId',
            select: 'title',
          },
          {
            path: 'stateId',
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
      }, // Populate countryId and select only the name field
    ];

    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.chatConversionModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async storeChatHistory(payload: object) {
    console.log(`This Action return store chat history: ${payload}`);
    const newChatConversion = await this.chatConversionModel.create(payload);
    return this.baseResponse.sendResponse(
      200,
      message.chatConversion.CHAT_CONVERSION_CREATED,
      newChatConversion,
    );
  }

  async updateChatHistory(
    userId: string,
    sessionId: string,
    updateChatConversionDto: UpdateChatConversionDto,
  ) {
    console.log(`This action updates a #${userId} Chat Conversion`);
    console.log('update chat conversions dto -->', updateChatConversionDto);
    if (updateChatConversionDto.message) {
    }
    const updateDetails = await this.chatConversionModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), sessionId: sessionId },
      {
        $push: {
          message: updateChatConversionDto, // Add newMessage to the message array
        },
      },
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.chatConversion.CHAT_CONVERSION_UPDATED,
      updateDetails,
    );
  }

  async findLastQuestionForInsert(userId: string) {
    console.log(`This Action find Question to Add with system question`);
    const lastQuestion = await this.chatConversionModel
      .findOne({ userId: userId })
      .sort({ createdAt: -1 })
      .select('message sessionId userId')
      .exec();
    if (lastQuestion && lastQuestion.message) {
      // Filter messages by category
      const filteredMessages = lastQuestion.message.filter(
        (msg) => msg.category === 'NTEP',
      );

      // Sort filtered messages by createdAt in descending order
      filteredMessages.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      // Return the most recent message (if any)
      return filteredMessages.length > 0 ? filteredMessages[0] : null;
    }
    console.log('last question details -->', lastQuestion);
  }

  async generateCsv(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(
        data,
        {
          header: true, // Include column headers
          columns: [
            { key: 'userId.name', header: 'Name' },
            { key: 'userId.phoneNo', header: 'Phone No' },
            { key: 'userId.email', header: 'Email' },
            { key: 'userId.countryDetails.0.title', header: 'Country Title' },
            { key: 'userId.stateDetails.0.title', header: 'State Title' },
            {
              key: 'userId.districtDetails.0.title',
              header: 'District Title',
            },
            { key: 'userId.blockDetails.0.title', header: 'Block Title' },
            { key: 'userId.cadreDetails.0.title', header: 'Cadre Title' },
            {
              key: 'userId.healthFacilityDetails.0.healthFacilityCode',
              header: 'Health-Facility Title',
            },
            { key: 'message.0.question.0', header: 'Question' },
            { key: 'message.0.answer.0', header: 'Answer' },
            { key: 'message.0.type', header: 'Message Type' },
            { key: 'message.0.category', header: 'Message Category' },
            { key: 'message.0.platform', header: 'Message Platform' },
            { key: 'sessionId', header: 'Message Session' },
            { key: 'createdAt', header: 'Date' },
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
}
