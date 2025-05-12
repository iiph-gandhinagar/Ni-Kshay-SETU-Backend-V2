/**
 * Controller responsible for handling operations related to queries.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and managing queries. It includes functionality for both subscribers
 * and administrators, with appropriate guards and permissions applied
 * to ensure secure access.
 *
 * Features:
 * - Create a new query.
 * - Retrieve query history for subscribers.
 * - Retrieve all queries with filtering and pagination options.
 * - Generate query reports and export data.
 * - Transfer queries between institutes.
 * - Retrieve open, closed, and transferred queries for an institute.
 * - Update query details.
 *
 * Guards:
 * - `SubscriberAuthGuard`: Ensures only authenticated subscribers can access certain endpoints.
 * - `AdminAuthGuard`: Ensures only authenticated administrators can access certain endpoints.
 * - `PermissionsGuard`: Ensures administrators have the required permissions for specific actions.
 *
 * Decorators:
 * - `@ApiTags('query')`: Groups all endpoints under the "query" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that endpoints require a bearer token for authentication.
 * - `@UsePipes(ValidationPipe)`: Automatically validates and transforms incoming request data.
 */
import {
  Body,
  Controller,
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
import { CreateQueryDto } from './dto/create-query.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { UpdateQueryDto } from './dto/update-query.dto';
import { QueryService } from './query.service';

@ApiTags('query')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Create a new Institute with manager' })
  @Post()
  create(@Body() createQueryDto: CreateQueryDto) {
    return this.queryService.create(createQueryDto);
  }

  @ApiOperation({ summary: 'Get All Subscriber Requested Query List' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'raisedBy', required: false })
  @ApiQuery({ name: 'respondedBy', required: false })
  @ApiQuery({ name: 'queryRespondedInstitute', required: false })
  @ApiQuery({ name: 'transferredInstitute', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(SubscriberAuthGuard)
  @Get('get-subscriber-query-list')
  QueryHistoryOfSubscriber(@Query() paginationDto: PaginationDto) {
    return this.queryService.QueryHistoryOfSubscriber(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Queries' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'queryRaisedRole', required: false })
  @ApiQuery({ name: 'queryRaisedInstitute', required: false })
  @ApiQuery({ name: 'raisedBy', required: false })
  @ApiQuery({ name: 'instituteId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.queryService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get all Queries report' })
  @ApiQuery({ name: 'illness', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'queryId', required: false })
  @ApiQuery({ name: 'response', required: false })
  @ApiQuery({ name: 'diagnosis', required: false })
  @ApiQuery({ name: 'chiefComplaint', required: false })
  @UseGuards(AdminAuthGuard)
  @Get('get-all-queries')
  async queryReport(@Query() paginationDto: PaginationDto) {
    return this.queryService.queryReport(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Query History' })
  @Post('transfer-query-by-subscriber')
  transferQueryBySubscriber(
    @Body() transferQueryDto: TransferQueryDto,
    @Req() request,
  ) {
    return this.queryService.transferQuery(
      transferQueryDto,
      request.user,
      'subscriber',
    );
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.transfer')
  @ApiOperation({ summary: 'Query History' })
  @Post('transfer-query')
  transferQuery(@Body() transferQueryDto: TransferQueryDto, @Req() request) {
    return this.queryService.transferQuery(
      transferQueryDto,
      request.user,
      'admin',
    );
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Query History' })
  @Get('query-history/:queryId')
  queryHistory(@Param('queryId') queryId: string) {
    return this.queryService.queryHistory(queryId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.report')
  @ApiOperation({ summary: 'Query Report of an Institute' })
  @Get('query-report/:instituteId')
  queriesReport(@Param('instituteId') instituteId: string) {
    return this.queryService.queriesReport(instituteId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.export')
  @ApiOperation({ summary: 'Query Report of an Institute' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['RaisedInstitute', 'RespondedInstitute'], // Static dropdown options
    description: 'Type of query (RaisedInstitute, RespondedInstitute)',
  })
  @Get('query-export/:instituteId')
  queriesExport(
    @Param('instituteId') instituteId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.queryService.queriesExport(paginationDto, instituteId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.index')
  @ApiOperation({ summary: 'Open Queries List of an Institute' })
  @Get('get-open-queries/:instituteId')
  openQueryList(@Param('instituteId') instituteId: string) {
    return this.queryService.openQueryList(instituteId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.index')
  @ApiOperation({ summary: 'Closed Queries List of an Institute' })
  @Get('get-closed-queries/:instituteId')
  closedQueryList(@Param('instituteId') instituteId: string) {
    return this.queryService.closedQueryList(instituteId);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.query.index')
  @ApiOperation({ summary: 'Transfer Queries List of an Institute' })
  @Get('get-transfer-queries/:instituteId')
  transferQueryList(@Param('instituteId') instituteId: string) {
    return this.queryService.transferQueryList(instituteId);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Update Query by id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueryDto: UpdateQueryDto) {
    return this.queryService.update(id, updateQueryDto);
  }
}
