/**
 * Controller responsible for handling feedback history operations.
 *
 * This controller provides endpoints for creating feedback history,
 * retrieving all feedback history with pagination, and exporting feedback
 * history as a CSV file. It includes guards for authentication and
 * permissions to ensure secure access.
 *
 * Features:
 * - Uses `ValidationPipe` for request validation and transformation.
 * - Guards for subscriber and admin authentication.
 * - Permissions-based access control for admin operations.
 * - Swagger documentation for API operations and query parameters.
 */
import {
  Body,
  Controller,
  Get,
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
import { CreateFeedbackHistoryDto } from './dto/create-feedback-history.dto';
import { FeedbackHistoryService } from './feedback-history.service';

@ApiTags('feedback-history')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('feedback-history')
export class FeedbackHistoryController {
  constructor(
    private readonly feedbackHistoryService: FeedbackHistoryService,
  ) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Create a Feedback History Of user' })
  @Post()
  create(
    @Body() createFeedbackHistoryDto: CreateFeedbackHistoryDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.feedbackHistoryService.create(createFeedbackHistoryDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Feedback History' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-feedback-history.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.feedbackHistoryService.findAll(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Feedback History' })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-feedback-history.index')
  @Get('feedback-history-csv')
  feedbackHistoryCsv(@Query() paginationDto: PaginationDto) {
    return this.feedbackHistoryService.feedbackHistoryCsv(paginationDto);
  }
}
