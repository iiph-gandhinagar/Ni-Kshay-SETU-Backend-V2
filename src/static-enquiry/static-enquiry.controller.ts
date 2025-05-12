/**
 * Controller for managing static enquiries.
 * 
 * This controller provides endpoints for creating, retrieving, and exporting static enquiries.
 * It includes functionality for pagination, filtering, and sorting of enquiries.

 * ## Guards and Permissions:
 * - Protected by `AdminAuthGuard` and `PermissionsGuard` for certain endpoints.
 * - Requires specific permissions such as `admin.static-enquiry.index` for accessing enquiry-related endpoints.
 */
import {
  Body,
  Controller,
  Get,
  Post,
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
import { CreateStaticEnquiryDto } from './dto/create-static-enquiry.dto';
import { StaticEnquiryService } from './static-enquiry.service';

@ApiTags('static-enquiry')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-enquiry')
export class StaticEnquiryController {
  constructor(private readonly staticEnquiryService: StaticEnquiryService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Enquiry' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-enquiry.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'subject', required: false })
  @ApiQuery({ name: 'message', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticEnquiryService.findAll(paginationDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Enquiries in csv' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-enquiry.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'subject', required: false })
  @ApiQuery({ name: 'message', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('enquiry-csv')
  inquiryCsv(@Query() paginationDto: PaginationDto) {
    return this.staticEnquiryService.inquiryCsv(paginationDto);
  }

  @ApiOperation({ summary: 'Create a new Inquiry' })
  @Post()
  create(@Body() createStaticEnquiryDto: CreateStaticEnquiryDto) {
    return this.staticEnquiryService.create(createStaticEnquiryDto);
  }
}
