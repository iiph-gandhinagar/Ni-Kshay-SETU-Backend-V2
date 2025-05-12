/**
 * Controller responsible for handling survey history-related operations.
 *
 * This controller provides endpoints for creating survey history records,
 * retrieving all survey histories with optional filters and pagination,
 * and exporting survey histories in CSV format.
 *
 * ## Guards:
 * - `SubscriberAuthGuard`: Protects the endpoint for creating survey history.
 * - `AdminAuthGuard` and `PermissionsGuard`: Protect endpoints for retrieving and exporting survey histories.
 *
 * ## Decorators:
 * - `@ApiTags`: Tags the controller for Swagger documentation.
 * - `@ApiBearerAuth`: Indicates the use of bearer token authentication.
 * - `@UsePipes`: Applies validation and transformation to incoming requests.
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
import { CreateSurveyHistoryDto } from './dto/create-survey-history.dto';
import { SurveyHistoryService } from './survey-history.service';

@ApiTags('survey-history')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('survey-history')
export class SurveyHistoryController {
  constructor(private readonly surveyHistoryService: SurveyHistoryService) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Create a Survey History Of user' })
  @Post()
  create(
    @Body() createSurveyHistoryDto: CreateSurveyHistoryDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.surveyHistoryService.create(createSurveyHistoryDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-history.index')
  @ApiOperation({ summary: 'Get All Survey History' })
  @ApiQuery({ name: 'surveyId', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userCadreType', required: false })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.surveyHistoryService.findAll(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-history.index')
  @ApiOperation({ summary: 'Get All Survey Histories in csv' })
  @ApiQuery({ name: 'surveyId', required: false })
  @ApiQuery({ name: 'userIds', required: false })
  @ApiQuery({ name: 'userCadreType', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('survey-history-csv')
  surveyHistoryCsv(@Query() paginationDto: PaginationDto) {
    return this.surveyHistoryService.surveyHistoryCsv(paginationDto);
  }
}
