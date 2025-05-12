/**
 * Controller for managing Question Bank operations.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * question bank records. It also includes additional endpoints for exporting question
 * data, retrieving all questions without pagination, and running scripts related to
 * question bank data.
 *
 * Features:
 * - Create a new question bank entry.
 * - Retrieve all question bank entries with optional filters and pagination.
 * - Export question data for reporting purposes.
 * - Retrieve all questions without pagination.
 * - Run scripts for question bank and kbase API data.
 * - Retrieve, update, or delete a specific question bank entry by ID.
 *
 * Guards:
 * - Uses `AdminAuthGuard` for authentication.
 * - Uses `PermissionsGuard` for role-based access control.
 *
 * Decorators:
 * - `@ApiTags` for grouping endpoints in Swagger documentation.
 * - `@ApiBearerAuth` for indicating the use of bearer token authentication.
 * - `@ApiOperation` and `@ApiQuery` for documenting API operations and query parameters.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { QuestionBankService } from './question-bank.service';

@ApiTags('question-bank')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @ApiOperation({ summary: 'Create a new Question Details' })
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.create')
  create(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    return this.questionBankService.create(createQuestionBankDto);
  }

  @ApiOperation({ summary: 'Get All Question Details' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'question', required: false })
  @ApiQuery({ name: 'option1', required: false })
  @ApiQuery({ name: 'option2', required: false })
  @ApiQuery({ name: 'option3', required: false })
  @ApiQuery({ name: 'option4', required: false })
  @ApiQuery({ name: 'correctAnswer', required: false })
  @ApiQuery({ name: 'qLevel', required: false })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.questionBankService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Question Details' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.export')
  @ApiQuery({ name: 'question', required: false })
  @ApiQuery({ name: 'option1', required: false })
  @ApiQuery({ name: 'option2', required: false })
  @ApiQuery({ name: 'option3', required: false })
  @ApiQuery({ name: 'option4', required: false })
  @ApiQuery({ name: 'correctAnswer', required: false })
  @ApiQuery({ name: 'qLevel', required: false })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @Get('get-questions-report')
  getAllQuestions(@Query() paginationDto: PaginationDto) {
    return this.questionBankService.getAllQuestions(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Question Details without pagination' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.create')
  @ApiQuery({ name: 'language', required: true })
  @ApiQuery({ name: 'question', required: false })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({ name: 'cadreIds', required: false, type: [String] })
  @ApiQuery({ name: 'isAllCadre', required: false, type: Boolean })
  @ApiQuery({ name: 'option1', required: false })
  @ApiQuery({ name: 'option2', required: false })
  @ApiQuery({ name: 'option3', required: false })
  @ApiQuery({ name: 'option4', required: false })
  @ApiQuery({ name: 'correctAnswer', required: false })
  @ApiQuery({ name: 'qLevel', required: false })
  @Get('get-all-questions')
  findAllQuestions(@Query() paginationDto: PaginationDto) {
    return this.questionBankService.findAllQuestions(paginationDto);
  }

  @ApiOperation({ summary: 'Question bank Details Script' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.question')
  @Get('script-question-bank')
  scriptForQuestion() {
    return this.questionBankService.scriptForQuestion();
  }

  @ApiOperation({ summary: 'Question bank kbase api Details Script' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.script')
  @Get('script-question-api')
  scriptForKbaseQuestion() {
    return this.questionBankService.scriptForKbaseQuestion();
  }

  @ApiOperation({ summary: 'Get Question Details by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Question Details by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionBankDto: UpdateQuestionBankDto,
  ) {
    return this.questionBankService.update(id, updateQuestionBankDto);
  }

  @ApiOperation({ summary: 'Delete Question Details by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.question-bank.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
