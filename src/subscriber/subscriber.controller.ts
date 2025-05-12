/**
 * SubscriberController handles all operations related to subscribers, including
 * authentication, profile management, and administrative tasks. It provides endpoints
 * for generating and verifying OTPs, managing subscriber data, and retrieving subscriber
 * reports. The controller is secured with various guards and permissions to ensure
 * proper access control.
 *
 * Key Features:
 * - OTP generation and verification for subscriber authentication.
 * - Subscriber login, logout, and token refresh functionality.
 * - CRUD operations for subscriber data.
 * - Administrative endpoints for managing and retrieving subscriber records.
 * - CSV generation for subscriber reports.
 * - Script execution for updating user statuses.
 *
 * Decorators:
 * - `@Controller('subscriber')`: Defines the base route for all endpoints in this controller.
 * - `@ApiTags('subscriber')`: Groups the endpoints under the "subscriber" tag in Swagger documentation.
 * - Various `@ApiOperation` and `@ApiQuery` decorators for detailed Swagger documentation.
 *
 * Guards and Pipes:
 * - Guards like `IpBlockerGuard`, `SubscriberAuthGuard`, `AdminAuthGuard`, and `PermissionsGuard`
 *   are used to secure endpoints.
 * - `ValidationPipe` is applied to validate and transform incoming request data.
 *
 * Dependencies:
 * - Injects `SubscriberService` to handle business logic for subscriber-related operations.
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
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import * as requestIp from 'request-ip';
import { IpBlockerGuard } from 'src/common/decorators/ipBlockerGuard';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateSubscriberV2Dto } from './dto/create-subscriber-v2.dto';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { LoginDTO } from './dto/login.dto';
import { OtpGenerationDto } from './dto/otp-generation.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ValidationPhoneNoDto } from './dto/validate-phoneno.dto';
import { SubscriberService } from './subscriber.service';

@ApiTags('subscriber')
@Controller('subscriber')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @ApiOperation({ summary: 'Generate Otp' })
  @Post('otp-generation')
  @UseGuards(IpBlockerGuard)
  @Throttle({ default: { limit: 250, ttl: 60000 } })
  async otpGeneration(
    @Body() otpGenerationDto: OtpGenerationDto,
    @Req() req: Request,
  ) {
    const ip = requestIp.getClientIp(req);
    const userAgent = req.headers['x-platform'] || 'web';
    return this.subscriberService.otpGeneration(
      otpGenerationDto,
      ip,
      userAgent,
    );
  }

  @ApiOperation({ summary: 'Verify Otp' })
  @Post('otp-verification')
  @UseGuards(IpBlockerGuard)
  @Throttle({ default: { limit: 250, ttl: 60000 } })
  async verifyOtp(@Body() loginDto: LoginDTO) {
    return this.subscriberService.verifyOtp(loginDto);
  }

  @ApiOperation({ summary: 'Validate Phone No' })
  @Post('validate-no')
  async validatePhoneNo(@Body() validationPhoneNoDto: ValidationPhoneNoDto) {
    return this.subscriberService.validatePhoneNo(validationPhoneNoDto);
  }

  @ApiOperation({ summary: 'Create a new Subscriber' })
  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.subscriberService.login(loginDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(SubscriberAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get Subscriber by id' })
  @Post('logout')
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.subscriberService.logout(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Refresh Token' })
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.subscriberService.refreshToken(refreshTokenDto);
  }

  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscriberService.create(createSubscriberDto);
  }

  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('create-v2')
  createV2(@Body() createSubscriberDto: CreateSubscriberV2Dto) {
    return this.subscriberService.createV2(createSubscriberDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.subscriber.index')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get All Subscriber' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreTypes', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'blockId', required: false, type: [String] })
  @ApiQuery({ name: 'healthFacilityId', required: false, type: [String] })
  @ApiQuery({ name: 'primaryCadre', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.subscriberService.findAll(paginationDto, _id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.subscriber.index')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get All Subscriber' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreTypes', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'blockId', required: false, type: [String] })
  @ApiQuery({ name: 'healthFacilityId', required: false, type: [String] })
  @ApiQuery({ name: 'primaryCadres', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-subscriber-paginated-records')
  subscriberReport(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.subscriberService.subscriberReport(paginationDto, _id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(SubscriberAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get Subscriber by id' })
  @Get('user-profile/:id')
  userProfile(@Param('id') id: string) {
    return this.subscriberService.userProfile(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.subscriber.index')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get Subscriber Details' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get('get-subscribers')
  getSubscribersList(@Query() paginationDto: PaginationDto) {
    return this.subscriberService.getSubscribersList(paginationDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'cadres', required: false })
  @ApiQuery({ name: 'districts', required: false })
  @ApiQuery({ name: 'countries', required: false })
  @ApiQuery({ name: 'states', required: false })
  @ApiQuery({ name: 'blocks', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'primaryCadre', required: false, type: [String] })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @Permissions('admin.subscriber.show')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('get-all-subscribers')
  async getAllSubscribers(
    @Req() request,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { _id } = request.user;
    const result = await this.subscriberService.getAllSubscribers(
      paginationDto,
      _id,
    );

    const csvData = await this.subscriberService.generateCsv(result.data);

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="subscriber_report.csv"',
    );
    res.send(csvData);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Send Forgot otp Manually' })
  @Get('forgot-otp/:id')
  sendOtpManually(@Param('id') id: string) {
    return this.subscriberService.sendOtpManually(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Run script to update user status' })
  @Get('user-status-update-script')
  subscriberFlagUpdateScript() {
    return this.subscriberService.subscriberFlagUpdateScript();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get Subscriber by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriberService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update Subscriber by id' })
  @Patch('update-details/:id')
  async updateUserDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateSubscriberDto,
  ) {
    return this.subscriberService.updateUser(id, updateUserDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.subscriber.edit')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update Subscriber by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    return this.subscriberService.update(id, updateSubscriberDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.subscriber.delete')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Delete Subscriber by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriberService.remove(id);
  }
}
