/**
 * Controller responsible for handling inquiries.
 *
 * This controller provides endpoints for creating inquiries and retrieving inquiries
 * with various filtering and pagination options. It includes guards for authentication
 * and authorization to ensure secure access to the endpoints.
 * Features:
 * - Uses `ValidationPipe` for request validation and transformation.
 * - Guards like `SubscriberAuthGuard`, `AdminAuthGuard`, and `PermissionsGuard` are applied for security.
 * - Supports query parameters for filtering, sorting, and pagination.
 *
 * Decorators:
 * - `@ApiTags('inquiry')`: Groups endpoints under the "inquiry" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that endpoints require a bearer token for authentication.
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
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryService } from './inquiry.service';

@ApiTags('inquiry')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @ApiOperation({ summary: 'Create a new District' })
  @UseGuards(SubscriberAuthGuard)
  @Post()
  create(@Body() createInquiryDto: CreateInquiryDto, @Req() request) {
    const { _id } = request.user;
    return this.inquiryService.create(createInquiryDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.enquiry.index')
  @ApiOperation({ summary: 'Get All Inquiry' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.inquiryService.findAll(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Inquiry' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNo', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-all-inquiries')
  getAllInquiry(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.inquiryService.getAllInquiry(paginationDto, _id);
  }
}
