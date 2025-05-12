/**
 * Controller responsible for handling operations related to automatic notifications.
 *
 * This controller provides endpoints for managing and retrieving automatic notifications.
 * It includes features such as pagination, sorting, and filtering.
 *
 * Decorators:
 * - `@ApiTags('automatic-notification')`: Groups this controller under the "automatic-notification" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that this controller requires bearer token authentication.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Applies validation and transformation to incoming requests.
 *
 * Guards:
 * - `@UseGuards(AdminAuthGuard)`: Ensures that only authenticated admin users can access the endpoints.
 * - `@UseGuards(PermissionsGuard)`: Ensures that users have the required permissions to access the endpoints.
 *
 * Permissions:
 * - `@Permissions('admin.automatic-notification.index')`: Restricts access to users with the specified permission.
 *
 * Dependencies:
 * - `AutomaticNotificationService`: Service layer for handling business logic related to automatic notifications.
 */
import {
  Controller,
  Get,
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AutomaticNotificationService } from './automatic-notification.service';

@ApiTags('automatic-notification')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('automatic-notification')
export class AutomaticNotificationController {
  constructor(
    private readonly automaticNotificationService: AutomaticNotificationService,
  ) {}

  @ApiOperation({ summary: 'Get All Automatic Notification' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.automatic-notification.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.automaticNotificationService.findAll(paginationDto);
  }
}
