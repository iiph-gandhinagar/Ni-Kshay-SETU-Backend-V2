/**
 * Controller responsible for handling Knowledge Base (Kbase) related operations.
 *
 * This controller provides endpoints for creating, retrieving, and exporting reports
 * related to Kbase courses, modules, chapters, and user interactions. It includes
 * functionality for both administrators and subscribers, with appropriate guards
 * and permissions applied to secure the endpoints.
 *
 * Features:
 * - Create a new Kbase entry.
 * - Retrieve courses, modules, and chapters based on user and course details.
 * - Generate and export Kbase course and user reports in CSV format.
 * - Track user interactions with Kbase content.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures only administrators can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures only subscribers can access certain endpoints.
 * - `PermissionsGuard`: Validates specific permissions for administrative actions.
 *
 * Decorators:
 * - `@ApiTags`: Groups endpoints under the "kbase" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates the use of bearer token authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery`: Documents query parameters for endpoints in Swagger.
 */
import {
  Body,
  Controller,
  Get,
  Param,
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
import { ReadContentDto } from './dto/create-kbase-history.dto';
import { CreateKbaseDto } from './dto/create-kbase.dto';
import { KbaseService } from './kbase.service';

@ApiTags('kbase')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('kbase')
export class KbaseController {
  constructor(private readonly kbaseService: KbaseService) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.kbase.create')
  @ApiOperation({ summary: 'Create a new Kbase' })
  @Post()
  async create(@Body() createKbaseDto: CreateKbaseDto) {
    return await this.kbaseService.create(createKbaseDto);
  }

  @ApiOperation({ summary: 'Get Course Base on cadre' })
  @UseGuards(SubscriberAuthGuard)
  @Get('get-course')
  async getCourse(@Req() request, @Query('courseTitle') courseTitle: string) {
    const { _id } = request.user;
    return await this.kbaseService.getCourse(_id, courseTitle);
  }

  @ApiOperation({ summary: 'Get Module With chapter' })
  @UseGuards(SubscriberAuthGuard)
  @Get('module-with-chapter')
  async getModuleWithChapter(@Req() request) {
    const { _id } = request.user;
    return await this.kbaseService.getModuleWithChapter(_id);
  }

  @ApiOperation({ summary: 'Get Chapter with Content page' })
  @UseGuards(SubscriberAuthGuard)
  @Get('chapter-with-content/:courseId')
  async getChapterWithContentPage(
    @Req() request,
    @Param('courseId') courseId: string,
  ) {
    const { _id } = request.user;

    return await this.kbaseService.getChapterWithContentPage(courseId, _id);
  }

  @ApiOperation({ summary: 'Get Kbase Course Report' })
  @UseGuards(AdminAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'courseTitle', required: false })
  @ApiQuery({ name: 'cadreIds', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('kbase-course-report')
  async kbaseCourseReport(@Query() paginationDto: PaginationDto) {
    return await this.kbaseService.kbaseCourseReport(paginationDto);
  }

  @ApiOperation({ summary: 'Get Kbase Course Report' })
  @UseGuards(AdminAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('kbase-course-report-csv')
  async kbaseCourseReportCsv(
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.kbaseService.kbaseCourseReport(paginationDto);
    const columns = [
      { key: 'courseId', header: 'Course Id' },
      { key: 'courseTitle', header: 'Course Title' },
      { key: 'cadreId', header: 'Cadre Id' },
      { key: 'cadreTitle', header: 'Cadre Title' },
      { key: 'totalModule', header: 'Total Modules' },
      { key: 'totalChapter', header: 'Total Chapters' },
      { key: 'totalContent', header: 'Total Content' },
      { key: 'userCount', header: 'User Count' },
    ];
    const csvData = await this.kbaseService.generateCsv(result.data, columns);

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="kbase_course_report.csv"',
    );
    res.send(csvData);
  }

  @ApiOperation({ summary: 'Get Kbase Report' })
  @UseGuards(AdminAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'courseTitle', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'userPhoneNo', required: false })
  @ApiQuery({ name: 'stateIds', required: false, type: [String] })
  @ApiQuery({ name: 'userCadreType', required: false, type: [String] })
  @ApiQuery({ name: 'userCadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtIds', required: false, type: [String] })
  @ApiQuery({ name: 'blockIds', required: false, type: [String] })
  @ApiQuery({ name: 'healthFacilityIds', required: false, type: [String] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('kbase-report')
  async kbaseReport(@Query() paginationDto: PaginationDto) {
    return await this.kbaseService.kbaseReport(paginationDto);
  }

  @ApiOperation({ summary: 'Get Kbase Report' })
  @UseGuards(AdminAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'courseTitle', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'userPhoneNo', required: false })
  @ApiQuery({ name: 'stateIds', required: false, type: [String] })
  @ApiQuery({ name: 'userCadreType', required: false, type: [String] })
  @ApiQuery({ name: 'userCadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtIds', required: false, type: [String] })
  @ApiQuery({ name: 'blockIds', required: false, type: [String] })
  @ApiQuery({ name: 'healthFacilityIds', required: false, type: [String] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('kbase-report-csv')
  async kbaseReportCsv(
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.kbaseService.kbaseReportCsv(paginationDto);
    const columns = [
      { key: 'userId.phoneNo', header: 'Phone No' },
      { key: 'userId.email', header: 'Email' },
      { key: 'userId.cadreType', header: 'Cadre Type' },
      { key: 'userId.cadreId.title', header: 'Cadre Title' },
      { key: 'userId.stateId.title', header: 'State Title' },
      { key: 'userId.districtId.title', header: 'District Title' },
      { key: 'userId.blockId.title', header: 'Block Title' },
      {
        key: 'userId.healthFacilityId.healthFacilityCode',
        header: 'Health-Facility Title',
      },
      { key: 'course.courseId', header: 'Course Id' },
      { key: 'course.courseTitle', header: 'Course Title' },
      { key: 'primaryCadre.0.cadreGroup.title', header: 'Primary Cadre Title' },
      { key: 'totalModule', header: 'Total Modules' },
      { key: 'totalReadModule', header: 'Read Modules' },
      { key: 'percentage', header: 'Percentage' },
      { key: 'lastAccessDate', header: 'Last Access Date' },
      { key: 'totalTime', header: 'Last Access Date' },
    ];
    const csvData = await this.kbaseService.generateCsv(result.data, columns);

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="kbase__report.csv"',
    );
    res.send(csvData);
  }

  @ApiOperation({ summary: 'Get Chapter with Content page' })
  @UseGuards(SubscriberAuthGuard)
  @Post('read-content')
  async readContent(@Body() readContentDto: ReadContentDto, @Req() request) {
    const { _id } = request.user;

    return await this.kbaseService.addReadContent(_id, readContentDto);
  }
}
