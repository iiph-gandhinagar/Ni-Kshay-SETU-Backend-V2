import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import mongoose from 'mongoose';
import { ChatConversionService } from 'src/chat-conversion/chat-conversion.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { SystemQuestionService } from './system-question.service';

jest.mock('axios');
const mockSystemQuestionModel = {
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: '1', ...data }),
  })),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findById: jest.fn().mockResolvedValue({ _id: '1', name: 'Test Block' }),
  findByIdAndUpdate: jest
    .fn()
    .mockResolvedValue({ _id: '1', title: 'Updated Block' }),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  exec: jest.fn().mockResolvedValue({}),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(20),
};

const mockFilterService = {
  filter: jest.fn().mockReturnValue({}),
};

const mockChatConversionService = {
  findOne: jest.fn().mockResolvedValue([]),
  storeChatHistory: jest.fn(),
  updateChatHistory: jest.fn(),
};

const mockSubscriberModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockChatConversionModel = {
  findOne: jest.fn(),
};

const mockCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockPrimaryCadreModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

const mockAdminUserModel = {
  findOne: jest.fn(),
};

const mockBaseResponse = {
  sendResponse: jest.fn().mockImplementation((statusCode, message, data) => ({
    statusCode,
    message,
    data,
  })),
};
describe('SystemQuestionService', () => {
  let service: SystemQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemQuestionService,
        {
          provide: getModelToken('SystemQuestion'),
          useValue: mockSystemQuestionModel,
        },
        { provide: getModelToken('Subscriber'), useValue: mockSubscriberModel },
        {
          provide: getModelToken('ChatConversion'),
          useValue: mockChatConversionModel,
        },
        { provide: getModelToken('Cadre'), useValue: mockCadreModel },
        { provide: getModelToken('AdminUser'), useValue: mockAdminUserModel },
        {
          provide: getModelToken('PrimaryCadre'),
          useValue: mockPrimaryCadreModel,
        },
        {
          provide: ChatConversionService,
          useValue: mockChatConversionService,
        },
        { provide: FilterService, useValue: mockFilterService },
        { provide: BaseResponse, useValue: mockBaseResponse },
      ],
    }).compile();

    service = module.get<SystemQuestionService>(SystemQuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create system question and call pinecone API', async () => {
      const dto = {
        questions: [{ en: 'What is the capital of France?' }],
        answers: [{ en: 'Answer of the system question' }],
        NTEPId: 123,
        active: false,
        category: 'category',
        title: 'title of System question',
      };

      const savedQuestion = {
        _id: '123',
        ...dto,
      };

      const pineconeResponse = { status: 'embedded' };

      mockSystemQuestionModel.create.mockResolvedValue(savedQuestion);
      (axios.get as jest.Mock).mockResolvedValue({ data: pineconeResponse });
      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'System Question Created successfully',
        data: savedQuestion,
      });

      const result = await service.create(dto);

      expect(mockSystemQuestionModel.create).toHaveBeenCalledWith(dto);
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.SYSTEM_QA_URL}/pinecone_embeddings`,
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'System Question Created successfully',
        data: savedQuestion,
      });
    });

    it('should handle error during creation', async () => {
      const dto = {
        questions: [{ en: 'What is the capital of France?' }],
        answers: [{ en: 'Answer of the system question' }],
        NTEPId: 123,
        active: false,
        category: 'category',
        title: 'title of System question',
      };

      mockSystemQuestionModel.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('findData', () => {
    it('should return system question based on category', async () => {
      const mockSystemsQuestion = [
        {
          _id: '123',
          questions: [{ en: 'What is the capital of France?' }],
          answers: [{ en: 'Answer of the system question' }],
          NTEPId: 123,
          active: false,
          category: 'System-tools',
          title: 'title of System question',
        },
      ];

      mockSystemQuestionModel.find.mockResolvedValue(mockSystemsQuestion);

      // Explicitly override any previous response mock
      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'System Question fetch successfully',
        data: mockSystemsQuestion,
      });

      const result = await service.findData();

      expect(mockSystemQuestionModel.find).toHaveBeenCalledWith({
        category: 'System-tools',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'System Question fetch successfully',
        data: mockSystemsQuestion,
      });
    });
  });

  describe('findAll', () => {
    it('should return System Question with pagination', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        page: 1,
        fromDate: '',
        toDate: '',
      };

      const mockSystemQuestions = [
        { name: 'System Question 1' },
        { name: 'System Question 2' },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSystemQuestions),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
      };
      mockSystemQuestionModel.find.mockReturnValue(mockQuery);
      mockSystemQuestionModel.countDocuments.mockResolvedValue(20);
      const result = await service.findAll(paginationDto);

      expect(mockSystemQuestionModel.find).toHaveBeenCalled();
      expect(mockSystemQuestionModel.countDocuments).toHaveBeenCalledWith({}); // ✅ Fixed here
      expect(result).toEqual({
        status: true,
        message: 'Data retrieved successfully',
        data: {
          list: mockSystemQuestions,
          totalItems: 20,
          currentPage: 1,
          totalPages: 2,
        },
        code: 200,
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated System Question', async () => {
      const updatedSystemQuestion = {
        _id: '1',
        title: 'Updated System Question',
      };
      mockSystemQuestionModel.findByIdAndUpdate.mockResolvedValue(
        updatedSystemQuestion,
      );

      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'System Question updated successfully',
        data: updatedSystemQuestion,
      });

      const result = await service.update('1', {
        title: 'Updated System Question',
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'System Question updated successfully',
        data: updatedSystemQuestion,
      });

      expect(mockSystemQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { title: 'Updated System Question' }, // include the space if it's meant to be there
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a System Question by ID and return success response', async () => {
      const id = '1';

      // Arrange: mock the delete operation and the response
      mockSystemQuestionModel.findByIdAndDelete.mockResolvedValueOnce({});
      mockBaseResponse.sendResponse.mockReturnValue({
        statusCode: 200,
        message: 'System Question deleted successfully',
        data: [],
      });

      // Act
      const result = await service.remove(id);

      // Assert
      expect(mockSystemQuestionModel.findByIdAndDelete).toHaveBeenCalledWith(
        id,
      );
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'System Question deleted successfully',
        [],
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'System Question deleted successfully',
        data: [],
      });
    });
  });

  describe('searchQuestionBySystemQuestion', () => {
    const userId = 'user123';

    const baseDto = {
      sessionId: 'session123',
      id: 'question-id-001',
      NTEPId: undefined, // or null
      query: 'query details',
    };

    it('should fetch system question from DB when NTEPId is not provided', async () => {
      const mockResult = [
        {
          questions: [{ en: 'What is AI?' }],
          answers: [{ en: 'Artificial Intelligence' }],
        },
      ];

      mockSystemQuestionModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockResult),
      });

      const expectedMessage = {
        question: mockResult[0].questions,
        answer: mockResult[0].answers,
        type: 'By Question',
        category: 'System-Question',
        platform: 'Postman',
      };

      const expectedResponse = {
        statusCode: 200,
        message: 'System Question answer fetch successfully',
        data: mockResult,
      };

      mockBaseResponse.sendResponse.mockReturnValue(expectedResponse);
      const spy = jest
        .spyOn(service, 'IsSessionIdExist')
        .mockResolvedValue(undefined);

      const result = await service.searchQuestionBySystemQuestion(
        userId,
        baseDto,
      );

      expect(mockSystemQuestionModel.find).toHaveBeenCalledWith({
        _id: baseDto.id,
      });
      expect(spy).toHaveBeenCalledWith(
        baseDto.sessionId,
        userId,
        expectedMessage,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should fetch NTEP question from external API when NTEPId is provided', async () => {
      const ntepDto = { ...baseDto, NTEPId: 456 };
      const ntepResponse = [
        {
          title: 'What is ML?',
          'H5P-id': 'Machine Learning Content',
        },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: ntepResponse });

      const expectedMessage = {
        question: 'What is ML?',
        answer: 'Machine Learning Content',
        type: 'By Question',
        category: 'NTEP',
        platform: 'Postman',
      };

      const expectedResponse = {
        statusCode: 200,
        message: 'Search Question by System Question',
        data: ntepResponse,
      };

      mockBaseResponse.sendResponse.mockReturnValue(expectedResponse);
      const spy = jest
        .spyOn(service, 'IsSessionIdExist')
        .mockResolvedValue(undefined);

      const result = await service.searchQuestionBySystemQuestion(
        userId,
        ntepDto,
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.NTEP_URL}nid=${ntepDto.NTEPId}&langcode=en`,
      );
      expect(spy).toHaveBeenCalledWith(
        ntepDto.sessionId,
        userId,
        expectedMessage,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('IsSessionIdExist', () => {
    const sessionId = 'session123';
    const userId = '645fabcde123456789012345'; // a valid 24-char ObjectId string
    const messages = {
      question: 'What is AI?',
      answer: 'Artificial Intelligence',
    };

    it('should call storeChatHistory when session does not exist', async () => {
      const mockFindOneResponse = { data: null };
      const mockPayload = {
        userId: new mongoose.Types.ObjectId(userId),
        sessionId,
        message: messages,
      };

      mockChatConversionService.findOne.mockResolvedValue(mockFindOneResponse);
      mockChatConversionService.storeChatHistory.mockResolvedValue({});

      const result = await service.IsSessionIdExist(
        sessionId,
        userId,
        messages,
      );

      expect(mockChatConversionService.findOne).toHaveBeenCalledWith(
        'sessionId',
        sessionId,
      );
      expect(mockChatConversionService.storeChatHistory).toHaveBeenCalledWith(
        mockPayload,
      );
      expect(
        mockChatConversionService.updateChatHistory,
      ).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call updateChatHistory when session exists', async () => {
      const mockFindOneResponse = { data: { some: 'sessionData' } };

      mockChatConversionService.findOne.mockResolvedValue(mockFindOneResponse);
      mockChatConversionService.updateChatHistory.mockResolvedValue({});

      const result = await service.IsSessionIdExist(
        sessionId,
        userId,
        messages,
      );

      expect(mockChatConversionService.findOne).toHaveBeenCalledWith(
        'sessionId',
        sessionId,
      );
      expect(mockChatConversionService.updateChatHistory).toHaveBeenCalledWith(
        userId,
        sessionId,
        messages,
      );
      expect(mockChatConversionService.storeChatHistory).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getSubNodeIdData', () => {
    const userId = '645fabcde123456789012345';
    const subNodeIds = ['101', '102'];

    const mockResponseData = [
      [{ title: 'Title 101', content: 'Content 101' }],
      [{ title: 'Title 102', content: 'Content 102' }],
    ];
    it('should fetch data for each subNodeId and return collected results', async () => {
      // Mock axios.get to return corresponding data
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockResponseData[0] })
        .mockResolvedValueOnce({ data: mockResponseData[1] });

      const expectedRecordsToPush = [
        mockResponseData[0][0],
        mockResponseData[1][0],
      ];

      const mockResponse = {
        statusCode: 200,
        message: 'Sub Nodes fetch successfully',
        data: expectedRecordsToPush,
      };

      mockBaseResponse.sendResponse.mockReturnValue(mockResponse);

      const result = await service.getSubNodeIdData(userId, subNodeIds);

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.NTEP_URL}nid=${subNodeIds[0]}&langcode=en`,
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.NTEP_URL}nid=${subNodeIds[1]}&langcode=en`,
      );

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'Sub Nodes fetch successfully',
        expectedRecordsToPush,
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle empty response.data gracefully', async () => {
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: mockResponseData[1] });

      const expectedRecordsToPush = [mockResponseData[1][0]];

      const mockResponse = {
        statusCode: 200,
        message: 'Sub Nodes fetch successfully',
        data: expectedRecordsToPush,
      };

      mockBaseResponse.sendResponse.mockReturnValue(mockResponse);

      const result = await service.getSubNodeIdData(userId, subNodeIds);

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('top10QuestionList', () => {
    it('should return top 10 questions with fallback to English if requested language not found', async () => {
      const userId = 'user123';
      const lang = 'fr';

      const mockUser = {
        userContext: {
          chatHotQuestionOffset: 0,
        },
      };

      const mockQuestions = [
        {
          _id: 'q1',
          questions: [{ en: 'What is your name?' }],
          NTEPId: null,
        },
        {
          _id: 'q2',
          questions: [{ en: 'Where do you live?', fr: 'Où habitez-vous ?' }],
          NTEPId: 456,
        },
      ];

      const ntepData = [{ title: 'Translated NTEP Question' }];
      (axios.get as jest.Mock).mockResolvedValue({ data: ntepData });

      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser),
        }),
      });
      mockSubscriberModel.findByIdAndUpdate.mockResolvedValue({});

      const mockFindSelectLimitExec = (data) => ({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(data),
      });

      const mockFindSelectLimitExecNoSkip = (data) => ({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(data),
      });

      // Mock the .find() calls in order
      mockSystemQuestionModel.find
        .mockReturnValueOnce(mockFindSelectLimitExec(mockQuestions)) // main
        .mockReturnValueOnce(mockFindSelectLimitExec(mockQuestions)) // fallback (en)
        .mockReturnValueOnce(mockFindSelectLimitExecNoSkip(mockQuestions)) // additional
        .mockReturnValueOnce(mockFindSelectLimitExec(mockQuestions));

      await service.top10QuestionList(lang, userId);

      expect(mockSubscriberModel.findById).toHaveBeenCalledWith(userId);
      expect(mockSystemQuestionModel.find).toHaveBeenCalledWith({
        active: true,
      });
      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ id: 'q1', question: 'What is your name?' }),
          expect.objectContaining({
            id: 'q2',
            question: 'Translated NTEP Question',
          }),
        ]),
      );
    });
  });

  describe('searchQuery', () => {
    it('should call chatbot API and return structured response based on category', async () => {
      const userId = 'user123';
      const lang = 'hi';
      const sessionId = 'sess123';
      const query = 'What is TB?';

      const searchAiQueryDto = {
        query,
        sessionId,
        platform: 'web',
      };

      // Mock data
      mockSubscriberModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreId: 'cadre123' }),
      });

      mockCadreModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ cadreGroup: 'group123' }),
      });

      mockPrimaryCadreModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ audienceId: 2 }),
      });

      const chatbotResponse = {
        Category: 'NTEP',
        answer: 'NTEP stands for National TB Elimination Programme',
      };

      (axios.post as jest.Mock).mockResolvedValue({ data: chatbotResponse });

      // Mock the session store method
      service['IsSessionIdExist'] = jest.fn().mockResolvedValue({});

      // Run
      await service.searchQuery(userId, searchAiQueryDto, lang);

      const expectedPayload = {
        text: query,
        selected_mode: 'both',
        selected_option: 2,
        userid: userId,
        langcode: lang,
        sessionid: sessionId,
      };

      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.CHATBOT_URL}/process_query`,
        expectedPayload,
      );

      expect(service['IsSessionIdExist']).toHaveBeenCalledWith(
        sessionId,
        userId,
        {
          question: query,
          answer: chatbotResponse.answer,
          type: 'By Search Query',
          category: 'NTEP',
          platform: 'web',
        },
      );

      expect(mockBaseResponse.sendResponse).toHaveBeenCalledWith(
        200,
        'System Question answer fetch successfully',
        {
          question: query,
          answer: chatbotResponse.answer,
          type: 'By Search Query',
          category: 'NTEP',
          platform: 'web',
        },
      );
    });
  });
});
