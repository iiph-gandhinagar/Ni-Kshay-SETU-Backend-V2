import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import mongoose, { Model } from 'mongoose';
import { CadreDocument } from 'src/cadre/entities/cadre.entity';
import { ChatConversionService } from 'src/chat-conversion/chat-conversion.service';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { PrimaryCadreDocument } from 'src/primary-cadre/entities/primary-cadre.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { CreateSystemQuestionDto } from './dto/create-system-question.dto';
import { SearchAiQueryDto } from './dto/search-ai-query.dto';
import { SearchQueriesDto } from './dto/search-queries.dto';
import { UpdateSystemQuestionDto } from './dto/update-system-question.dto';
import { SystemQuestionDocument } from './entities/system-question.entity';
dotenv.config();

@Injectable()
export class SystemQuestionService {
  constructor(
    @InjectModel('SystemQuestion')
    private readonly systemQuestionModel: Model<SystemQuestionDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('Cadre')
    private readonly cadreModel: Model<CadreDocument>,
    @InjectModel('PrimaryCadre')
    private readonly primaryCadreModel: Model<PrimaryCadreDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => ChatConversionService))
    private readonly chatConversionService: ChatConversionService,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<SystemQuestionDocument> {
    console.log('inside find by property App Config----->');
    return this.systemQuestionModel.findOne({ [property]: value }).exec();
  }

  async findUnique(findDetails: any, id: any) {
    console.log('inside find by property country ----->');
    return this.systemQuestionModel.findOne({ findDetails, id });
  }
  async create(createSystemQuestionDto: CreateSystemQuestionDto) {
    try {
      console.log('This action adds a new System Question');
      const newSystemQuestion = await this.systemQuestionModel.create(
        createSystemQuestionDto,
      );
      console.log('before calling pinecone api');
      const url = `${process.env.SYSTEM_QA_URL}/pinecone_embeddings`;
      const apiResponse = (await axios.get(url))?.data;

      console.log('pinecone result --->', apiResponse);
      return this.baseResponse.sendResponse(
        200,
        message.systemQuestion.SYSTEM_QUESTION_CREATED,
        newSystemQuestion,
      );
    } catch (error) {
      console.error('❌ Error creating system question:', error);
      throw new HttpException(
        {
          message: 'Error creating system question',
          errors: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findData() {
    console.log('This action return all System Question Without pagination');
    const masterSystemQuestion = await this.systemQuestionModel.find({
      category: 'System-tools',
    });
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SYSTEM_QUESTION_LIST,
      masterSystemQuestion,
    );
  }
  async top10QuestionList(lang: string, userId: string) {
    console.log(
      `This action return top 10 question list for language ${lang} for user: ${userId}`,
    );
    const limit = 10;
    const getOffsetValue = await this.subscriberModel
      .findById(userId)
      .select('userContext')
      .lean(true);
    console.log('offset value --->', getOffsetValue.userContext);
    let topQuestions = await this.systemQuestionModel
      .find({ active: true })
      .select(`title questions NTEPId`)
      .skip(getOffsetValue.userContext.chatHotQuestionOffset)
      .limit(limit)
      .exec();

    const hasRequestedLangData = topQuestions.some((item) => {
      // Check if questions array contains any object with the requested language
      return item.questions.some((q) => q[lang]);
    });
    if (!hasRequestedLangData) {
      console.log('inside has requested default language --->');
      topQuestions = await this.systemQuestionModel
        .find({ active: true })
        .select(`title questions.en NTEPId`)
        .skip(getOffsetValue.userContext.chatHotQuestionOffset)
        .limit(limit)
        .exec();
    }

    let setValue = getOffsetValue.userContext.chatHotQuestionOffset + limit;
    const remainingRecords = limit - topQuestions.length;
    if (topQuestions.length < limit) {
      // Calculate the number of remaining records needed

      // Fetch remaining records from the start index
      let additionalQuestions = await this.systemQuestionModel
        .find({ active: true })
        .select(`title questions NTEPId`)
        .limit(remainingRecords)
        .exec();

      const hasRequestedLangData = additionalQuestions.some((item) => {
        // Check if questions array contains any object with the requested language
        return item.questions.some((q) => q[lang]);
      });
      if (!hasRequestedLangData) {
        console.log('inside has requested default language --->');
        additionalQuestions = await this.systemQuestionModel
          .find({ active: true })
          .select(`title questions.en NTEPId`)
          .skip(getOffsetValue.userContext.chatHotQuestionOffset)
          .limit(limit)
          .exec();
      }
      // Merge both sets of data
      topQuestions = [...topQuestions, ...additionalQuestions];
      setValue = remainingRecords;
    }
    await this.subscriberModel.findByIdAndUpdate(
      userId,
      {
        $set: { 'userContext.chatHotQuestionOffset': setValue },
      },
      { new: true },
    );

    const results = await Promise.all(
      topQuestions.map(async (doc) => {
        console.log(
          'doc.questions[0][lang] --->',
          lang,
          doc.questions[0][lang],
          doc.questions[0]['en'],
          doc.questions[0] !== undefined,
          doc.questions[0],
          doc._id,
        );

        let questions = '';
        if (doc.questions.length > 0 && doc.questions[0]) {
          // Use optional chaining and fallback to 'en' if lang is not found
          questions = doc.questions[0][lang] || doc.questions[0]['en'];
        }
        const NTEPId = doc.NTEPId;
        // console.log('NTEP id --->', NTEPId);
        if (NTEPId) {
          const url = `${process.env.NTEP_URL}nid=${NTEPId}&langcode=${lang}`;
          const apiResponse = (await axios.get(url))?.data;
          // console.log('api response --->', apiResponse);
          questions = apiResponse[0]?.title || '';
        }
        return {
          id: doc._id,
          question: questions,
          NTEPId: NTEPId,
        };
      }),
    );
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.TOP_10_QUESTIONS,
      results,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all System Question');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(this.systemQuestionModel, paginationDto, [], query);
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} System Question`);
    const getSystemQuestionById = await this.systemQuestionModel
      .findById(id)
      .exec();
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SYSTEM_QUESTION_LIST,
      getSystemQuestionById,
    );
  }

  async update(id: string, updateSystemQuestionDto: UpdateSystemQuestionDto) {
    console.log(`This action updates a #${id} System Question`);

    const updateDetails = await this.systemQuestionModel.findByIdAndUpdate(
      id,
      updateSystemQuestionDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SYSTEM_QUESTION_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} System Question`);
    await this.systemQuestionModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SYSTEM_QUESTION_DELETE,
      [],
    );
  }

  async searchQuestionBySystemQuestion(
    userId: string,
    searchQueriesDto: SearchQueriesDto,
  ) {
    console.log(
      `This Action returns search question answer from system tool: ${userId}`,
    );
    const { sessionId, id, NTEPId } = searchQueriesDto;
    let result: [] | object;
    let messages: object;
    if (NTEPId) {
      const url = `${process.env.NTEP_URL}nid=${NTEPId}&langcode=en`;
      result = (await axios.get(url)).data;
      messages = {
        question: result[0]['title'],
        answer: result[0]['H5P-id'],
        type: 'By Question',
        category: 'NTEP',
        platform: 'Postman',
      };
    } else {
      result = await this.systemQuestionModel
        .find({ _id: id })
        .select('answers.en questions.en');
      messages = {
        question: result[0]['questions'],
        answer: result[0]['answers'],
        type: 'By Question',
        category: 'System-Question',
        platform: 'Postman',
      };
    }
    if (!result) {
      /* Call Python api if result is not found!! */
    }
    await this.IsSessionIdExist(sessionId, userId, messages);
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SEARCH_BY_SYSTEM_QUESTION,
      result,
    );
  }

  async searchQuery(
    userId: string,
    searchAiQueryDto: SearchAiQueryDto,
    lang: string,
  ) {
    console.log('userId and search queries ---->', userId, searchAiQueryDto);
    const { query, sessionId, platform } = searchAiQueryDto;
    let messages: object;
    const cadre = await this.subscriberModel.findById(userId).select('cadreId');
    const primaryCadre = await this.cadreModel
      .findById(cadre.cadreId)
      .select('cadreGroup');
    console.log(primaryCadre, '---------chatbot payload primaryCadre');

    const audienceId = await this.primaryCadreModel
      .findById(primaryCadre.cadreGroup)
      .select('audienceId');
    console.log(audienceId, '---------chatbot payload audienceId');
    const url = `${process.env.CHATBOT_URL}/process_query`;
    const payload = {
      text: query,
      selected_mode: 'both',
      selected_option: +audienceId.audienceId || 0,
      userid: userId,
      langcode: lang ? lang : 'en', //hi,mr,ta,gu,te
      sessionid: sessionId,
    };
    console.log(payload, '-----chatbot payload response');
    const result = (await axios.post(url, payload)).data;
    if (result?.Category === 'NTEP') {
      messages = {
        question: query,
        answer: result.answer,
        type: 'By Search Query',
        category: 'NTEP',
        platform: platform,
      };
    } else if (result?.Category === 'Manage TB') {
      messages = {
        question: { en: query },
        answer: { en: result },
        type: 'By Search Query',
        category: result?.Category,
        platform: platform,
      };
    } else if (result?.Category === 'Query Response') {
      messages = {
        question: { en: query },
        answer: { en: result },
        type: 'By Search Query',
        category: result?.Category,
        platform: platform,
      };
    } else if (result?.Category === 'Assessment tool') {
      messages = {
        question: { en: query },
        answer: { en: result },
        type: 'By Search Query',
        category: result?.Category,
        platform: platform,
      };
    } else {
      messages = {
        question: { en: query },
        answer: { en: result['result'] },
        type: 'By Search Query',
        category: 'AI Response',
        platform: platform,
      };
    }
    const startTime2 = Date.now();
    await this.IsSessionIdExist(sessionId, userId, messages);
    const endTime2 = Date.now();
    console.log(
      'start time to store Session Details or update Session Details ',
      endTime2 - startTime2,
      ' in ms',
    );
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SEARCH_BY_QUERY,
      messages,
    );
  }

  async IsSessionIdExist(sessionId: string, userId: string, messages: object) {
    console.log('user Id in is session exist --->', userId);
    const isSessionIdExist = await this.chatConversionService.findOne(
      'sessionId',
      sessionId,
    );
    console.log('isSessionId exist --->', isSessionIdExist);
    const payload = {
      userId: new mongoose.Types.ObjectId(userId),
      sessionId: sessionId,
      message: messages,
    };
    console.log('payload details --->', payload);
    if (!isSessionIdExist.data) {
      await this.chatConversionService.storeChatHistory(payload);
    } else {
      await this.chatConversionService.updateChatHistory(
        userId,
        sessionId,
        messages,
      );
    }
    return true;
  }

  async getSubNodeIdData(userId: string, subNodeIds: string[]) {
    console.log(`SubnodeIDs are : ${subNodeIds} and userId --->${userId}`);
    const recordsToPush = [];
    for (const record of subNodeIds) {
      const url = `${process.env.NTEP_URL}nid=${record}&langcode=en`;
      console.log('url --->', url);
      const response = await axios.get(url);
      if (response && response.data.length > 0) {
        recordsToPush.push(response.data[0]);
      }
    }
    return this.baseResponse.sendResponse(
      200,
      message.systemQuestion.SUB_NODE_DETAILS,
      recordsToPush,
    );
  }
}
