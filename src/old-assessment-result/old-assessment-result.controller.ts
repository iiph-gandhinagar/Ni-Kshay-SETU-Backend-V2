/**
 * Controller responsible for handling operations related to old assessment results.
 *
 * This controller provides endpoints to:
 * - Retrieve paginated old assessment results.
 * - Fetch unique titles for old assessments.
 * - Retrieve all old assessment results without pagination, with an option to export them as a CSV file.
 *
 * The controller is secured with `AdminAuthGuard` and uses a `ValidationPipe` to validate and transform incoming requests.
 *
 * @module OldAssessmentResultController
 */
import {
  Controller,
  Get,
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { OldAssessmentResultService } from './old-assessment-result.service';

@ApiTags('old-assessment-result')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('old-assessment-result')
export class OldAssessmentResultController {
  constructor(
    private readonly oldAssessmentResultService: OldAssessmentResultService,
  ) {}

  @ApiOperation({ summary: 'Get All Old Assessment Response' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'stateCountry', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.oldAssessmentResultService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get All unique title' })
  @Get('title-drop-down')
  getUniqueTitle() {
    return this.oldAssessmentResultService.getUniqueTitle();
  }

  @ApiOperation({ summary: 'Get All Assessment without pagination' })
  @ApiQuery({ name: 'obtainedMarks', required: false })
  @ApiQuery({ name: 'assessmentId', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'totalMarks', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-old-assessment-result')
  @UseGuards(AdminAuthGuard)
  async getAllResponse(
    @Req() request,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { _id } = request.user;
    const result = await this.oldAssessmentResultService.getAllResponse(
      paginationDto,
      _id,
    );
    const csvData = await this.oldAssessmentResultService.generateCsv(
      result.data,
    );

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="old_assessment_results.csv"',
    );
    res.send(csvData);
  }
}
