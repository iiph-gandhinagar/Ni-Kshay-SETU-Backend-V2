/**
 * Controller responsible for handling feedback-related operations.
 *
 * This controller provides endpoints for managing feedback, including creating,
 * retrieving, updating, and deleting feedback. It also includes functionality
 * for subscribers to retrieve feedback questions.
 *
 * ## Guards:
 * - `AdminAuthGuard`: Ensures that only authenticated admins can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures that only authenticated subscribers can access specific endpoints.
 * - `PermissionsGuard`: Ensures that the user has the required permissions for certain operations.
 *
 * ## Decorators:
 * - `@ApiTags('feedback')`: Groups the endpoints under the "feedback" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UsePipes(ValidationPipe)`: Automatically validates and transforms incoming request data.
 *
 * ## Dependencies:
 * - `FeedbackService`: Service layer responsible for business logic related to feedback.
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
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Feedback' })
  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Feedback' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'feedback_question', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.feedback.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.feedbackService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Feedback Question (Subscriber)' })
  @ApiQuery({ name: 'feedbackSkip', required: true, type: Boolean })
  @Get('get-all-feedback')
  getFeedbackQuestions(@Req() request, @Query() feedbackSkip: boolean) {
    const { _id } = request.user;
    return this.feedbackService.getFeedbackDetails(_id, feedbackSkip);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Feedback by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Feedback by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Feedback by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.feedback.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
