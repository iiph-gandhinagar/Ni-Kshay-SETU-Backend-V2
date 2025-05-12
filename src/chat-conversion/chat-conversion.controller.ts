/**
 * Controller responsible for handling chat conversion-related operations.
 * Provides endpoints for retrieving chat histories, exporting chat histories as CSV,
 * and fetching chat details by session ID.
 *
 * This controller includes endpoints for both admin and subscriber users, with appropriate
 * guards to enforce access control.
 *
 * Features:
 * - Retrieve paginated chat histories for admin users.
 * - Retrieve paginated chat histories for subscriber users.
 * - Export chat histories as a CSV file for admin users.
 * - Fetch chat details by session ID for subscriber users.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures only admin users can access specific endpoints.
 * - `SubscriberAuthGuard`: Ensures only subscriber users can access specific endpoints.
 *
 */
import {
  Controller,
  Get,
  Param,
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
import { ChatConversionService } from './chat-conversion.service';

@ApiTags('chat-conversion')
@Controller('chat-conversion')
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatConversionController {
  constructor(private readonly chatConversionService: ChatConversionService) {}

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Chat history for Admin User!' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-chat-histories')
  findAllChats(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.chatConversionService.chatHistoriesForAdmin(paginationDto, _id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Chat history!' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(SubscriberAuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.chatConversionService.chatHistory(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Chat history!' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-chat-histories-csv')
  async findAllChatsCsv(
    @Req() request,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { _id } = request.user;
    const result = await this.chatConversionService.chatHistoryCsv(
      paginationDto,
      _id,
    );
    const csvData = await this.chatConversionService.generateCsv(result.data);

    // Set headers and send CSV as response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="chat_history_report.csv"',
    );
    res.send(csvData);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Chat history by sessionId' })
  @Get('/:sessionId')
  findOne(@Param('sessionId') sessionId: string) {
    return this.chatConversionService.findById(sessionId);
  }
}
