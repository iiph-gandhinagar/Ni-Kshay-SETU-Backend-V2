/**
 * Controller responsible for handling all operations related to assessments.
 *
 * This controller provides endpoints for managing assessments, including creating, updating,
 * deleting, and retrieving assessments. It also includes functionality for sending notifications,
 * setting weekly goals, storing assessment results, and generating reports.
 *
 * The controller uses various guards to enforce authentication and authorization,
 * ensuring that only authorized users can access specific endpoints.
 *
 * Key Features:
 * - Create, update, and delete assessments.
 * - Retrieve assessments with filtering and pagination options.
 * - Manage weekly goals and pro assessment results for subscribers.
 * - Generate reports for assessment results and questions.
 * - Copy assessments and handle old assessment responses.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures that only admin users can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures that only subscribers can access specific endpoints.
 * - `PermissionsGuard`: Enforces fine-grained permission checks for admin operations.
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
import { AssessmentService } from './assessment.service';
import { ActiveFlagDto } from './dto/active-flag.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { StoreProAssessmentDto } from './dto/store-pro-assessment.dto';
import { StoreWeeklyGoalDto } from './dto/store-weekly-goal.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@ApiTags('assessment')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.create')
  @ApiOperation({ summary: 'Create a new Assessment' })
  @Post()
  create(@Body() createAssessmentDto: CreateAssessmentDto, @Req() request) {
    const { _id } = request.user;
    return this.assessmentService.create(createAssessmentDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.create')
  @Post('send-initial-notification/:id')
  sendInitialNotification(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.assessmentService.sendInitialNotification(id, _id);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Set Weekly Goal of Assessment' })
  @ApiHeader({
    name: 'lang',
    description:
      'The default language of the response (English,Hindi,Gujarati)',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Post('store-weekly-goal')
  setWeeklyGoal(
    @Body() storeWeeklyGoalDto: StoreWeeklyGoalDto,
    @Req() request,
    @Headers('lang') lang: string,
  ) {
    const { _id } = request.user;
    return this.assessmentService.storeWeeklyGoal(
      _id,
      storeWeeklyGoalDto,
      lang,
    );
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'store Pro Assessment result' })
  @Post('store-pro-assessment-result')
  storeProAssessmentResult(
    @Body() storeProAssessmentDto: StoreProAssessmentDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.assessmentService.storeProAssessmentResult(
      _id,
      storeProAssessmentDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.index')
  @ApiOperation({ summary: 'Get All Assessment' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'timeToComplete', required: false })
  @ApiQuery({ name: 'countryId', required: false })
  @ApiQuery({ name: 'stateId', required: false })
  @ApiQuery({ name: 'districtId', required: false })
  @ApiQuery({ name: 'cadreId', required: false })
  @ApiQuery({ name: 'cadreType', required: false })
  @ApiQuery({ name: 'assessmentType', required: false })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.assessmentService.findAll(paginationDto, _id);
  }

  @Get('get-all-assessment-list')
  getAllAssessments() {
    return this.assessmentService.assessmentFilter();
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('get-all-assessment')
  getAllAssessment(@Req() request) {
    const { _id } = request.user;
    return this.assessmentService.getAllAssessment(_id);
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('get-past-assessment')
  getAllPastAssessment(@Req() request) {
    const { _id } = request.user;
    return this.assessmentService.getAllPastAssessment(_id);
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('get-assessment-performance')
  assessmentPerformance(@Req() request) {
    const { _id } = request.user;
    return this.assessmentService.assessmentPerformance(_id);
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('get-future-assessment')
  futureAssessment(@Req() request) {
    const { _id } = request.user;
    return this.assessmentService.futureAssessment(_id);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.edit')
  @ApiOperation({ summary: 'Update Active Flag' })
  @Post('update-active-flag')
  activeFlagValidation(@Body() activeFlagDto: ActiveFlagDto) {
    return this.assessmentService.activeFlagValidation(activeFlagDto);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.report')
  @Get('assessment-result-report/:assessmentId')
  assessmentResultReport(@Param('assessmentId') assessmentId: string) {
    return this.assessmentService.assessmentResultReport(assessmentId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.assessment-question')
  @Get('assessment-question-report/:assessmentId')
  assessmentQuestionReport(@Param('assessmentId') assessmentId: string) {
    return this.assessmentService.assessmentQuestionReport(assessmentId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('script-for-old-assessment-response')
  oldAssessmentResponseScript() {
    return this.assessmentService.oldAssessmentResponseScript();
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.copy')
  @Get('copy-assessment/:assessmentId')
  copyAssessment(@Param('assessmentId') assessmentId: string) {
    return this.assessmentService.copyAssessment(assessmentId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.show')
  @ApiOperation({ summary: 'Get Assessment by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.edit')
  @ApiOperation({ summary: 'Update Assessment by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
  ) {
    return this.assessmentService.update(id, updateAssessmentDto);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment.delete')
  @ApiOperation({ summary: 'Delete Assessment by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }
}
