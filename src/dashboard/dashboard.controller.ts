/**
 * DashboardController
 *
 * This controller handles various endpoints related to dashboard functionalities
 * for both web and admin panels. It provides APIs for fetching data such as
 * dashboard statistics, map counts, module usage, leaderboard data, and more.
 *
 * Key Features:
 * - Provides web dashboard data.
 * - Secured endpoints for admin panel dashboard statistics.
 * - APIs for fetching counts related to various modules like chatbot, assessments,
 *   subscribers, visitors, and screening tools.
 * - Supports filtering data based on state, district, blocks, and date ranges.
 * - Includes endpoints for fetching India TopoJson and balance details of 3rd party APIs.
 *
 * Security:
 * - Most endpoints are secured with `AdminAuthGuard` and require a valid access token.
 * - Validation is enforced using `ValidationPipe` to ensure proper query parameter structure.
 */
import {
  Controller,
  Get,
  Param,
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UsePipes(new ValidationPipe({ transform: true }))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'web Dashboard data' })
  @Get('')
  getWebDashboardData() {
    return this.dashboardService.getWebDashboardData();
  }

  @ApiOperation({ summary: 'India TopoJson' })
  @Get('get-india-topo-json')
  getIndiaTopoJson() {
    return this.dashboardService.topoJson();
  }

  @ApiOperation({ summary: 'Get Admin Panel Dashboard' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-admin-panel-dashboard')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  adminPanelDashboard(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.adminPanelDashboard(paginationDto);
  }

  @ApiOperation({
    summary: 'Get Map Count',
  })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-Map-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  mapCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.mapCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get Cadre Wise Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-cadre-wise-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  cadreWiseCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.cadreWiseGraph(paginationDto);
  }

  @ApiOperation({ summary: 'Get Module Usage Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-module-usage-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  moduleUsage(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.moduleUsage(paginationDto);
  }

  @ApiOperation({ summary: 'Get leaderboard Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-leaderboard-count')
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  leaderboard(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.leaderboard(paginationDto);
  }

  @ApiOperation({ summary: 'Get chatbot Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-chatbot-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  chatbot(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.chatbot(paginationDto);
  }

  @ApiOperation({ summary: 'Get manage-tb Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-manage-tb-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  manageTb(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.manageTb(paginationDto);
  }

  @ApiOperation({ summary: 'Get query2coe Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-query2coe-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  query2coe(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.query2coe(paginationDto);
  }

  @ApiOperation({ summary: 'Get assessment-graph Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-assessment-graph-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  assessmentResponse(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.assessmentResponse(paginationDto);
  }

  @ApiOperation({ summary: 'Get Pro-assessment-graph Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-pro-assessment-graph-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  proAssessmentResponse(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.proAssessmentGraph(paginationDto);
  }

  @ApiOperation({ summary: 'Get subscriber Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-subscriber-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  subscriberCounts(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.subscriberCounts(paginationDto);
  }

  @ApiOperation({ summary: 'Get visitor Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-visitor-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  visitorCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.visitorCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get Assessments Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-assessment-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  assessmentCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.assessmentCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get General Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-general-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  generalCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.generalCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get total minute spent Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-total-minute-spent-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  totalMinuteSpent(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.totalMinuteSpent(paginationDto);
  }

  @ApiOperation({ summary: 'Get screening tool Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-screening-tool-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  screeningToolCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.screeningToolCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get Chatbot Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-chat-bot-count')
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'blocks', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'type', required: true })
  chatbotCount(@Query() paginationDto: PaginationDto) {
    return this.dashboardService.chatbotCount(paginationDto);
  }

  @ApiOperation({ summary: 'Get App-opened Count' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-app-opened-count/:type')
  appOpenedCount(@Param('type') type: string) {
    return this.dashboardService.appOpenedCount(type);
  }

  @ApiOperation({ summary: 'Get Balance details of 3rd party apis' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-balance')
  balanceCheck() {
    return this.dashboardService.balanceCheck();
  }
}
