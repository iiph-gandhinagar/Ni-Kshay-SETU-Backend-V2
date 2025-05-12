import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { QuestionBankService } from './question-bank.service';

const mockQuestionBankModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest
    .fn()
    .mockResolvedValue({ _id: '1', name: 'Test Question Bank' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Question Bank' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  filter: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockAssessmentModel = {
  findOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};
describe('QuestionBankService', () => {
  let service: QuestionBankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionBankService,
        {
          provide: getModelToken('QuestionBank'),
          useValue: mockQuestionBankModel,
        },
        { provide: getModelToken('Assessment'), useValue: mockAssessmentModel },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<QuestionBankService>(QuestionBankService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('create', () => {
    it('should create a Question bank', async () => {
      const createQuestionBankDto = {
        id: 1,
        language: 'en',
        question: "questions bank's question",
        option1: 'option 1',
        option2: 'option2',
        option3: 'option3',
        option4: 'option4',
        correctAnswer: 'option1',
        category: 'drugs',
        cadreType: ['State_Level'],
        cadreId: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        isAllCadre: false,
        explanation: 'nothing',
        qLevel: 'Easy',
        isVisible: false,
      };
      const mockQuestionBank = {
        _id: new mongoose.Types.ObjectId('6666c830eb18953046b1b56b'),
        ...createQuestionBankDto,
      };
      mockQuestionBankModel.create.mockResolvedValue(mockQuestionBank);

      const result = await service.create(createQuestionBankDto);
      console.log('result--->', result);
      expect(mockQuestionBankModel.create).toHaveBeenCalledWith(
        createQuestionBankDto,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank Created successfully',
        data: mockQuestionBank,
      });
    });
  });

  describe('findAll', () => {
    it('should return Question bank with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockQuestionBank = [
        { name: 'Question Bank 1' },
        { name: 'Question Bank 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockQuestionBank),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };

      mockQuestionBankModel.find.mockReturnValue(mockQuery);
      mockQuestionBankModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockQuestionBank,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
      expect(mockQuestionBankModel.find).toHaveBeenCalled();
      expect(mockQuestionBankModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('findAllQuestions', () => {
    it('should return Question bank', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockQuestionBank = [
        { isVisible: true, question: 'Question Bank 1' },
      ];
      const filteredQuery = { isVisible: true };

      mockQuestionBankModel.filter.mockReturnValue(filteredQuery);
      mockQuestionBankModel.find.mockResolvedValue(mockQuestionBank);
      // mockQuestionBankModel.countDocuments.mockResolvedValue(20);

      const result = await service.findAllQuestions(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockQuestionBankModel.find).toHaveBeenCalledWith({
        ...filteredQuery,
        isVisible: true,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank fetch successfully',
        data: mockQuestionBank,
      });
      expect(mockQuestionBankModel.find).toHaveBeenCalled();
    });
  });

  describe('getAllQuestions', () => {
    it('should return Question bank', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };
      const mockQuestionBank = [
        { isVisible: true, question: 'Question Bank 1' },
      ];
      const filteredQuery = { isVisible: true };

      mockQuestionBankModel.filter.mockReturnValue(filteredQuery);
      mockQuestionBankModel.find.mockResolvedValue(mockQuestionBank);
      // mockQuestionBankModel.countDocuments.mockResolvedValue(20);

      const result = await service.getAllQuestions(paginationDto);

      expect(mockFilterService.filter).toHaveBeenCalledWith(paginationDto);
      expect(mockQuestionBankModel.find).toHaveBeenCalledWith({
        ...filteredQuery,
        isVisible: true,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank fetch successfully',
        data: mockQuestionBank,
      });
      expect(mockQuestionBankModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a Question Bank by ID', async () => {
      const mockQuestionBank = { _id: '1', name: 'Test Question Bank' };
      mockQuestionBankModel.findById.mockReturnValue(mockQuestionBank);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank fetch successfully',
        data: mockQuestionBank,
      });
      expect(mockQuestionBankModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if Question Bank not found', async () => {
      mockQuestionBankModel.findById.mockResolvedValueOnce(null);

      const result = await service.findOne('1');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank fetch successfully',
        data: null,
      });
      // expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated Question Bank', async () => {
      const updatedBlock = {
        _id: '6666c830eb18953046b1b56b',
        title: 'Updated Question Bank',
      };
      const validObjectId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );

      mockAssessmentModel.findOne.mockResolvedValueOnce(null);
      mockQuestionBankModel.findByIdAndUpdate.mockResolvedValue(updatedBlock);

      const result = await service.update('6666c830eb18953046b1b56b', {
        question: 'Updated Question Bank',
      });
      expect(mockAssessmentModel.findOne).toHaveBeenCalledWith({
        questions: { $in: [validObjectId] },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank updated successfully',
        data: updatedBlock,
      });
      expect(mockQuestionBankModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '6666c830eb18953046b1b56b',
        { question: 'Updated Question Bank' },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a Question Bank by ID if not linked to an Assessment', async () => {
      const validObjectId = new mongoose.Types.ObjectId(
        '6666c830eb18953046b1b56b',
      );

      mockAssessmentModel.findOne.mockResolvedValueOnce(null);
      mockQuestionBankModel.findByIdAndDelete.mockResolvedValueOnce({});

      const result = await service.remove(validObjectId.toString());

      expect(mockAssessmentModel.findOne).toHaveBeenCalledWith({
        questions: { $in: [validObjectId] },
      });

      expect(mockQuestionBankModel.findByIdAndDelete).toHaveBeenCalledWith(
        validObjectId.toString(),
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'Question Bank deleted successfully',
        data: [],
      });
    });
  });
});
