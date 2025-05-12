/**
 * Controller responsible for handling operations related to System Questions.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * system questions, as well as performing various search operations. It includes
 * functionality for both admin and subscriber roles, with appropriate guards and
 * permissions applied to ensure secure access.
 *
 * Features:
 * - Create a new system question.
 * - Retrieve all system questions with or without pagination.
 * - Search system questions by specific criteria or user queries.
 * - Retrieve top 10 system questions.
 * - Retrieve sub-node data for a given set of IDs.
 * - Update or delete a system question by ID.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures only admin users can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures only subscribers can access certain endpoints.
 * - `PermissionsGuard`: Validates user permissions for specific operations.
 *
 * Decorators:
 * - `@ApiTags`: Groups endpoints under the "system-question" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates the use of bearer token authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery` and `@ApiHeader`: Documents query parameters and headers for specific endpoints.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateSystemQuestionDto } from './dto/create-system-question.dto';
import { SearchAiQueryDto } from './dto/search-ai-query.dto';
import { SearchQueriesDto } from './dto/search-queries.dto';
import { UpdateSystemQuestionDto } from './dto/update-system-question.dto';
import { SystemQuestionService } from './system-question.service';

@ApiTags('system-question')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('system-question')
export class SystemQuestionController {
  constructor(private readonly systemQuestionService: SystemQuestionService) {}

  @ApiOperation({ summary: 'Create a new System Question' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.system-question.create')
  @Post()
  create(@Body() createSystemQuestionDto: CreateSystemQuestionDto) {
    return this.systemQuestionService.create(createSystemQuestionDto);
  }

  @ApiOperation({ summary: 'Get All System Question Without Pagination' })
  @Get('get-all-system-questions')
  findData() {
    return this.systemQuestionService.findData();
  }

  @ApiOperation({ summary: 'Search result by system question' })
  @UseGuards(SubscriberAuthGuard)
  @Post('search-by-system-question')
  searchQuestionBySystemQuestion(
    @Req() request,
    @Body() searchQueriesDto: SearchQueriesDto,
  ) {
    const { _id } = request.user;
    // console.log('user --->', request.user);
    return this.systemQuestionService.searchQuestionBySystemQuestion(
      _id,
      searchQueriesDto,
    );
  }

  @ApiOperation({ summary: 'Search result by user Query' })
  @UseGuards(SubscriberAuthGuard)
  @Post('search-by-query')
  @ApiHeader({
    name: 'lang',
    description:
      'The default language of the response (English,Hindi,Gujarati)',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  searchQuery(
    @Req() request,
    @Body() searchAiQueryDto: SearchAiQueryDto,
    @Headers('lang') lang: string,
  ) {
    const platform = request.headers['user-agent'];
    const { _id } = request.user;
    searchAiQueryDto.platform = platform;
    return this.systemQuestionService.searchQuery(_id, searchAiQueryDto, lang);
  }

  @ApiOperation({ summary: 'Get SubNode Id Data' })
  @UseGuards(SubscriberAuthGuard)
  @Post('get-sub-node-data')
  getSubNodeData(@Req() request, @Body() subNodeId: []) {
    const { _id } = request.user;
    return this.systemQuestionService.getSubNodeIdData(_id, subNodeId);
  }

  @ApiOperation({ summary: 'Get Top 10 Questions' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-top-question')
  getTopQuestions(@Req() request) {
    const lang = request.headers['lang'] || 'en';
    // console.log('lang -->', lang, request.user);
    const { _id } = request.user;
    return this.systemQuestionService.top10QuestionList(lang, _id);
  }

  @ApiOperation({ summary: 'Get All System Question' })
  @UseGuards(AdminAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.system-question.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.systemQuestionService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get System Question by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.system-question.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemQuestionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update System Question by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.system-question.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSystemQuestionDto: UpdateSystemQuestionDto,
  ) {
    return this.systemQuestionService.update(id, updateSystemQuestionDto);
  }

  @ApiOperation({ summary: 'Delete System Question by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.system-question.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemQuestionService.remove(id);
  }
}
