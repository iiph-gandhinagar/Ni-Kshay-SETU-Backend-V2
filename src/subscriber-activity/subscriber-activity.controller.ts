/**
 * Controller for managing subscriber activities.
 *
 * This controller handles various endpoints related to subscriber activities,
 * including creating activities for users and guests, retrieving subscriber activity
 * data, generating CSV reports, and executing scripts for subscriber activities.
 *
 * It uses guards to enforce authentication and authorization for specific routes
 * and integrates with the `SubscriberActivityService` to perform the required operations.
 *
 * Features:
 * - Store user and guest activities.
 * - Retrieve subscriber activity data with or without pagination.
 * - Generate CSV reports for subscriber activities.
 * - Execute scripts for subscriber activity management.
 * - Retrieve progress of subscriber activities for authenticated users.
 *
 * Decorators:
 * - `@ApiTags('subscriber-activity')`: Groups the endpoints under the "subscriber-activity" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Applies validation and transformation to incoming requests.
 *
 * Guards:
 * - `SubscriberAuthGuard`: Ensures that only authenticated subscribers can access certain routes.
 * - `AdminAuthGuard`: Ensures that only authenticated admins can access certain routes.
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { CreateSubscriberActivityDto } from './dto/create-subscriber-activity.dto';
import { SubscriberActivityService } from './subscriber-activity.service';

@ApiTags('subscriber-activity')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('subscriber-activity')
export class SubscriberActivityController {
  constructor(
    private readonly subscriberActivityService: SubscriberActivityService,
  ) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Store User Activities' })
  @Post()
  create(
    @Body() createSubscriberActivityDto: CreateSubscriberActivityDto,
    @Req() req,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress; // Get IP Address
    const userId = req.user._id;
    console.log('useragent ---->', ipAddress);
    createSubscriberActivityDto.ipAddress = ipAddress;
    createSubscriberActivityDto.userId = userId;
    return this.subscriberActivityService.create(createSubscriberActivityDto);
  }

  @ApiOperation({ summary: 'Store Guest Activities' })
  @Post('guest-activity')
  createActivity(
    @Body() createSubscriberActivityDto: CreateSubscriberActivityDto,
    @Req() req,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress; // Get IP Address
    console.log('useragent ---->', ipAddress);
    createSubscriberActivityDto.ipAddress = ipAddress;
    return this.subscriberActivityService.create(createSubscriberActivityDto);
  }

  @ApiOperation({ summary: 'Script for Subscriber activity' })
  @UseGuards(AdminAuthGuard)
  @Get('subscriber-action-master-data')
  getAllActions() {
    return this.subscriberActivityService.getAllActions();
  }

  @ApiOperation({ summary: 'Script for Subscriber activity' })
  @UseGuards(AdminAuthGuard)
  @Get('script-subscriber-activity')
  scriptForSubscriberActivity() {
    return this.subscriberActivityService.scriptForSubscriberActivity();
  }

  @ApiOperation({ summary: 'Get All Subscriber Activity' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'userCadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtIds', required: false, type: [String] })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'stateIds', required: false, type: [String] })
  @ApiQuery({ name: 'blockIds', required: false, type: [String] })
  @ApiQuery({ name: 'actions', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.subscriberActivityService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get All Subscriber Activity' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'userIdFilter', required: false, type: [String] })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'countries', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreTypes', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'blockId', required: false, type: [String] })
  @ApiQuery({ name: 'healthFacilityId', required: false, type: [String] })
  @ApiQuery({ name: 'actions', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @Get('subscriber-activity-records')
  subscriberActivityRecords(
    @Query() paginationDto: PaginationDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.subscriberActivityService.subscriberActivityRecords(
      paginationDto,
      _id,
    );
  }

  @ApiOperation({ summary: 'Get All Subscriber Activity without pagination' })
  @ApiQuery({ name: 'userIds', required: false, type: [String] })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'userCadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtIds', required: false, type: [String] })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'stateIds', required: false, type: [String] })
  @ApiQuery({ name: 'blockIds', required: false, type: [String] })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @UseGuards(AdminAuthGuard)
  @Get('get-all-subscriber-activity')
  async getAllSubscriberActivity(
    @Req() request,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { _id } = request.user;
    const result =
      await this.subscriberActivityService.getAllSubscriberActivity(
        paginationDto,
        _id,
      );
    const csvData = await this.subscriberActivityService.generateCsv(
      result.data,
    );

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="subscriber-activity.csv"',
    );
    res.send(csvData);
  }
  @UseGuards(SubscriberAuthGuard)
  @Get('progress')
  getAllActivites(@Req() req) {
    const userId = req.user._id;
    return this.subscriberActivityService.getAllActivites(userId);
  }
}
