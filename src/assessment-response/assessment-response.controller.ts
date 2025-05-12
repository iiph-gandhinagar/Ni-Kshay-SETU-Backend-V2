/**
 * Controller responsible for handling operations related to assessment responses.
 *
 * This controller provides endpoints for managing user assessment responses,
 * retrieving assessment results, generating CSV reports, and fetching user-specific
 * assessment details and performance data. It includes both subscriber and admin
 * protected routes, leveraging guards and permissions for access control.
 *
 * ## Guards:
 * - `SubscriberAuthGuard`: Protects subscriber-specific routes.
 * - `AdminAuthGuard`: Protects admin-specific routes.
 * - `PermissionsGuard`: Ensures proper permissions for admin routes.
 */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
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
import { Response } from 'express';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AssessmentResponseService } from './assessment-response.service';
import { CreateAssessmentResponseDto } from './dto/create-assessment-response.dto';
import { StoreQuestionAnswerDto } from './dto/store-question-answer.dto';

@ApiTags('assessment-response')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('assessment-response')
export class AssessmentResponseController {
  constructor(
    private readonly assessmentResponseService: AssessmentResponseService,
  ) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Store user Assessment Response' })
  @Post()
  create(@Body() createAssessmentResponseDto: CreateAssessmentResponseDto) {
    return this.assessmentResponseService.create(createAssessmentResponseDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Store user Assessment Response' })
  @ApiQuery({ name: 'idFilter', required: false, type: String })
  @Post('store-assessment-response')
  storeAssessmentResponse(
    @Req() request,
    @Body() storeQuestionAnswerDto: StoreQuestionAnswerDto,
    @Query() idFilter: any,
  ) {
    const { _id } = request.user;
    return this.assessmentResponseService.storeAssessmentResponse(
      _id,
      storeQuestionAnswerDto,
      idFilter,
    );
  }

  @ApiOperation({ summary: 'Get All Assessment' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'assessmentId', required: false, type: [String] })
  @ApiQuery({ name: 'obtainedMarks', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userCadreType', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'totalMarks', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-assessment.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.assessmentResponseService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get All Assessment without pagination' })
  @ApiQuery({ name: 'obtainedMarks', required: false })
  @ApiQuery({ name: 'assessmentId', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'totalMarks', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-all-assessment-result')
  @UseGuards(AdminAuthGuard)
  async getAllResponse(
    @Req() request,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { _id } = request.user;
    const result = await this.assessmentResponseService.getAllResponse(
      paginationDto,
      _id,
    );
    const csvData = await this.assessmentResponseService.generateCsv(
      result.data,
    );

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="assessment_results.csv"',
    );
    res.send(csvData);
  }

  @ApiOperation({ summary: 'Get User Assessment Details' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'assessmentId', required: true })
  @UseGuards(SubscriberAuthGuard)
  @Get('subscriber-assessment-progress')
  subscriberAssessmentProgress(
    @Query('userId') userId: string, // extract userId
    @Query('assessmentId') assessmentId: string,
  ) {
    return this.assessmentResponseService.getSubscriberAssessmentDetails(
      userId,
      assessmentId,
    );
  }

  @ApiOperation({ summary: 'Get User Assessment Details' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'userAssessmentId', required: true })
  @UseGuards(SubscriberAuthGuard)
  @Get('subscriber-assessment-result')
  getUserResult(
    @Query('userId') userId: string, // extract userId
    @Query('userAssessmentId') userAssessmentId: string,
  ) {
    return this.assessmentResponseService.getUserResult(
      userId,
      userAssessmentId,
    );
  }

  @ApiOperation({ summary: 'Get User pro Assessment Score' })
  @ApiQuery({ name: 'assessmentId', required: true })
  @UseGuards(SubscriberAuthGuard)
  @Get('subscriber-pro-active-result')
  proAssessmentScore(
    @Req() request,
    @Query('assessmentId') assessmentId: string,
  ) {
    const { _id } = request.user;
    return this.assessmentResponseService.proAssessmentScore(_id, assessmentId);
  }

  @ApiOperation({ summary: 'Get User pro Assessment Performance' })
  @UseGuards(SubscriberAuthGuard)
  @Get('subscriber-pro-assessment-performance')
  proAssessmentPerformance(@Req() request) {
    const { _id } = request.user;
    return this.assessmentResponseService.proAssessmentPerformance(_id);
  }

  @ApiOperation({ summary: 'Get User pro Assessment Report' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @Get('subscriber-pro-assessment-report')
  proAssessmentReport(@Query() paginationDto: PaginationDto) {
    return this.assessmentResponseService.proAssessmentReport(paginationDto);
  }
}
