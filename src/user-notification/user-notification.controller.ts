/**
 * Controller responsible for handling user notifications.
 *
 * This controller provides endpoints for creating, retrieving, and managing user notifications.
 * It includes functionality for both admin and subscriber roles, with appropriate guards and permissions applied.
 *
 * Features:
 * - Uses `ValidationPipe` for request validation and transformation.
 * - Guards (`AdminAuthGuard`, `SubscriberAuthGuard`, `PermissionsGuard`) ensure secure access.
 * - Swagger decorators provide API documentation and query parameter descriptions.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateUserNotificationDto } from './dto/create-user-notification.dto';
import { UserNotificationService } from './user-notification.service';

@ApiTags('user-notification')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('user-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new User Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-notification.create')
  @Post()
  create(
    @Body() createUserNotificationDto: CreateUserNotificationDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.userNotificationService.create(createUserNotificationDto, _id);
  }

  @ApiOperation({ summary: 'Get All User Notification' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(SubscriberAuthGuard)
  @Get('get-all-notification')
  async getUserNotification(
    @Query() paginationDto: PaginationDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    const notification = await this.userNotificationService.getUserNotification(
      paginationDto,
      _id,
    );
    // console.log('after controller call-->', JSON.stringify(notification));
    return notification;
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All User Notification' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'types', required: false })
  @ApiQuery({ name: 'countryId', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-notification.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.userNotificationService.findAll(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get User Notification by id' })
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-notification.index')
  findOne(@Param('id') id: string) {
    return this.userNotificationService.findOne(id);
  }
}
