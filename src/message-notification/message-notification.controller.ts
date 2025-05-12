/**
 * Controller responsible for handling operations related to message notifications.
 *
 * This controller provides endpoints to create and retrieve message notifications.
 * It is secured with authentication and permission guards, and utilizes validation pipes
 * to ensure proper request data handling.
 *
 * Decorators:
 * - `@ApiTags('message-notification')`: Groups the endpoints under the "message-notification" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AdminAuthGuard, PermissionsGuard)`: Protects the endpoints with admin authentication and permission checks.
 * - `@UsePipes(ValidationPipe)`: Applies validation to incoming request data.
 *
 * Dependencies:
 * - `MessageNotificationService`: Service layer for handling business logic related to message notifications.
 */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
import { CreateMessageNotificationDto } from './dto/create-message-notification.dto';
import { MessageNotificationService } from './message-notification.service';

@ApiTags('message-notification')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(PermissionsGuard)
@Controller('message-notification')
export class MessageNotificationController {
  constructor(
    private readonly messageNotificationService: MessageNotificationService,
  ) {}

  @ApiOperation({ summary: 'Create a new Message Notification' })
  @Permissions('admin.message-notification.create')
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createMessageNotificationDto: CreateMessageNotificationDto,
  ) {
    if (!files) {
      throw new BadRequestException('No file provided');
    }
    return this.messageNotificationService.create(
      files,
      createMessageNotificationDto,
    );
  }

  @ApiOperation({ summary: 'Get All Message Notification' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userName', required: false })
  @ApiQuery({ name: 'phoneNo', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messageNotificationService.findAll(paginationDto);
  }
}
