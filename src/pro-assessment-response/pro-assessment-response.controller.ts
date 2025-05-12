/**
 * Controller responsible for handling operations related to Pro Assessment Responses.
 *
 * This controller provides endpoints to retrieve assessment responses with or without pagination,
 * and also supports exporting assessment results in CSV format. It includes features like
 * query-based filtering, sorting, and permissions-based access control.
 *
 * Decorators:
 * - `@ApiTags('pro-assessment-response')`: Groups the endpoints under the "pro-assessment-response" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AdminAuthGuard)`: Ensures that only authenticated admin users can access the endpoints.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Automatically validates and transforms incoming request data.
 *
 * Guards:
 * - `AdminAuthGuard`: Verifies that the user is authenticated as an admin.
 * - `PermissionsGuard`: Ensures the user has the required permissions to access specific endpoints.
 *
 * Permissions:
 * - `admin.user-assessment.index`: Required permission for accessing the `findAll` endpoint.
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { ProAssessmentResponseService } from './pro-assessment-response.service';

@ApiTags('pro-assessment-response')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('pro-assessment-response')
export class ProAssessmentResponseController {
  constructor(
    private readonly proAssessmentResponseService: ProAssessmentResponseService,
  ) {}

  @ApiOperation({ summary: 'Get All Assessment' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'assessmentId', required: false, type: [String] })
  @ApiQuery({ name: 'assessmentTitle', required: false })
  @ApiQuery({ name: 'obtainedMarks', required: false })
  @ApiQuery({ name: 'userIds', required: false })
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
    return this.proAssessmentResponseService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get All Assessment without pagination' })
  @ApiQuery({ name: 'obtainedMarks', required: false })
  @ApiQuery({ name: 'assessmentId', required: false })
  @ApiQuery({ name: 'assessmentTitle', required: false })
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
    const result = await this.proAssessmentResponseService.proAssessmentCsv(
      paginationDto,
      _id,
    );
    const csvData = await this.proAssessmentResponseService.generateCsv(
      result.data,
    );

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="pro_assessment_results.csv"',
    );
    res.send(csvData);
  }
}
