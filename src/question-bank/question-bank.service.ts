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
import * as fs from 'fs';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import * as path from 'path';
import { AssessmentDocument } from 'src/assessment/entities/assessment.entity';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { QuestionBankDocument } from './entities/question-bank.entity';
dotenv.config();
@Injectable()
export class QuestionBankService {
  constructor(
    @InjectModel('QuestionBank')
    private readonly questionBankModel: Model<QuestionBankDocument>,
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async findByProperty(
    property: string,
    value: string,
  ): Promise<QuestionBankDocument> {
    console.log('inside find by property Question----->');
    return this.questionBankModel.findOne({ [property]: value }).exec();
  }
  async create(createQuestionBankDto: CreateQuestionBankDto) {
    console.log('This action adds a new Question in bank');
    const newQuestionBank = await this.questionBankModel.create(
      createQuestionBankDto,
    );
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_CREATED,
      newQuestionBank,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Question');
    paginationDto.isVisible = true;
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'cadreId', select: 'title' }, // Populate countryId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.questionBankModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async findAllQuestions(paginationDto: PaginationDto) {
    console.log(`This Action returns all questions from question bank`);
    const query = await this.filterService.filter(paginationDto);
    query.isVisible = true;

    const question = await this.questionBankModel.find(query);
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_LIST,
      question,
    );
  }

  async getAllQuestions(paginationDto: PaginationDto) {
    console.log(
      `This Action returns all questions from question bank based on language and cadre`,
    );
    const query = await this.filterService.filter(paginationDto);
    const question = await this.questionBankModel.find(query);
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_LIST,
      question,
    );
  }

  async findOne(id: string) {
    console.log(`This action returns a #${id} Question`);
    const getQuestionBankById = await this.questionBankModel.findById(id);
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_LIST,
      getQuestionBankById,
    );
  }

  async update(id: string, updateQuestionBankDto: UpdateQuestionBankDto) {
    console.log(`This action updates a #${id} Question`);
    const record = await this.assessmentModel.findOne({
      questions: { $in: [new mongoose.Types.ObjectId(id)] },
    });
    if (record) {
      throw new HttpException(
        {
          message: 'Can`t Edit Question used in Assessment',
          errors: 'bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateDetails = await this.questionBankModel.findByIdAndUpdate(
      id,
      updateQuestionBankDto,
      { new: true },
    );
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_UPDATED,
      updateDetails,
    );
  }

  async remove(id: string) {
    console.log(`This action removes a #${id} Question`);
    const record = await this.assessmentModel.findOne({
      questions: { $in: [new mongoose.Types.ObjectId(id)] },
    });
    if (record) {
      return this.baseResponse.sendError(
        400,
        'Cant Delete Question used in Assessment',
        [],
      );
    }
    await this.questionBankModel.findByIdAndDelete(id);
    return this.baseResponse.sendResponse(
      200,
      message.questionBank.QUESTION_BANK_DELETE,
      [],
    );
  }

  async scriptForQuestion() {
    console.log(`Script for migration assessment question`);
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/assessment_questions.json',
    );

    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const BATCH_SIZE = 500; // Define a suitable batch size
    let batch = [];
    for (const record of jsonData) {
      try {
        console.log('Processing record ID:', record.id);
        const recordExist = await this.questionBankModel
          .find({ question: record.question })
          .select('question');
        if (recordExist.length == 0) {
          const result = {
            question: record.question ? JSON.parse(record.question) : '',
            option1: record.option1 ? JSON.parse(record.option1) : '',
            option2: record.option2 ? JSON.parse(record.option2) : '',
            option3: record.option3 ? JSON.parse(record.option3) : '',
            option4: record.option4 ? JSON.parse(record.option4) : '',
            correctAnswer: record.correct_answer,
            category: record.category,
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at),
            deletedAt: record.deleted_at ? new Date(record.deleted_at) : '',
            id: record.id,
          };
          batch.push(result);
        }

        if (batch.length >= BATCH_SIZE) {
          await this.questionBankModel.insertMany(batch);
          console.log(`Inserted batch of ${batch.length} records`);
          batch = [];
        }
        // break;
      } catch (error) {
        console.error(
          'Error Assessment Question Bank of Id:',
          record.id,
          error,
        );
      }
    }
  }

  async scriptForKbaseQuestion() {
    console.log(
      `This Function add Kbase questions into Question bank with Our Structure`,
    );
    try {
      const apiUrl = process.env.QUESTION_URL;
      console.log('api url -->', apiUrl, process.env.NTEP_CRED);
      const { data } = await axios.get(apiUrl, {
        headers: {
          Authorization: process.env.QUESTION_AUTH,
        },
      });
      for (const item of data) {
        const optionsArray = item.field_qchoices.split('|');
        const payload = {
          language: 'en',
          question: item.field_question,
          option1: optionsArray[0],
          option2: optionsArray[1],
          option3: optionsArray[2],
          option4: optionsArray[3],
          correctAnswer: item.field_qcchoice,
          explanation: item.field_qexpl,
          category: 'KBASE',
          qLevel: item.field_qdlevel,
          isVisible: true,
        };
        await this.questionBankModel.create(payload);
      }
    } catch (error) {
      console.error('❌ Error fetching Question API data:', error);
      throw error;
    }
  }
}
