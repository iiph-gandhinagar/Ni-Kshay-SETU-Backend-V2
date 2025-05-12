/**
 * Controller responsible for handling subscriber progress-related operations.
 * This includes fetching activities, achievements, leaderboard details,
 * and subscriber rankings with support for pagination and filtering.
 *
 * The controller uses guards to enforce access control:
 * - `SubscriberAuthGuard` for subscriber-specific endpoints.
 * - `AdminAuthGuard` for admin-specific endpoints.
 *
 * API documentation is provided using Swagger decorators for better integration
 * with API documentation tools.
 */
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { SubscriberProgressService } from './subscriber-progress.service';
@ApiTags('subscriber-progress')
@ApiBearerAuth('access-token')
@Controller('subscriber-progress')
export class SubscriberProgressController {
  constructor(
    private readonly subscriberProgressService: SubscriberProgressService,
  ) {}

  @UseGuards(SubscriberAuthGuard)
  @Get()
  getAllActivites(@Req() req) {
    const userId = req.user._id;
    return this.subscriberProgressService.getAndUpdateProgressByLevel(userId);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Top 3 Subscriber rank list' })
  @Get('top-3-subscriber-rank')
  top3SubscriberList(@Req() req) {
    const userData = req.user;
    return this.subscriberProgressService.top3SubscriberList(userData);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get paginated subscriber progress List' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('all-subscriber')
  getAllSubscriberProgress(@Req() req, @Query() paginationDto: PaginationDto) {
    const userData = req.user;
    return this.subscriberProgressService.getUserAndAllUsersTaskSummary(
      userData,
      paginationDto,
    );
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('all-achievement-by-level')
  getAchievementByLevel(@Req() req) {
    const userId = req.user._id;
    return this.subscriberProgressService.getAchievementByLevelAndBadge(userId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('leaderboard-details/:id')
  getLeaderboardDetailsOfUser(@Param('id') id: string) {
    return this.subscriberProgressService.getLeaderboardDetailsOfUser(id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('all-subscriber-rank')
  @Get()
  @ApiQuery({
    name: 'levelId',
    required: false,
    type: String,
    description: 'Filter by level ID',
  })
  @ApiQuery({
    name: 'badgeId',
    required: false,
    type: String,
    description: 'Filter by badge ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort By Field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Set Order of Field',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default is 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of records per page (default is 10)',
    example: 10,
  })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  async getListOfSubscriberRank(
    @Query('levelId') levelId?: string,
    @Query('badgeId') badgeId?: string,
    @Query('userId') userId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.subscriberProgressService.getListOfSubscriberRank(
      levelId,
      badgeId,
      userId,
      sortBy,
      sortOrder,
      fromDate,
      toDate,
      page,
      limit,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('all-subscriber-rank-csv')
  @Get()
  @ApiQuery({
    name: 'levelId',
    required: false,
    type: String,
    description: 'Filter by level ID',
  })
  @ApiQuery({
    name: 'badgeId',
    required: false,
    type: String,
    description: 'Filter by badge ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  async getListOfSubscriberRankCsv(
    @Query('levelId') levelId?: string,
    @Query('badgeId') badgeId?: string,
    @Query('userId') userId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.subscriberProgressService.getListOfSubscriberRankCsv(
      levelId,
      badgeId,
      userId,
      fromDate,
      toDate,
    );
  }
}
