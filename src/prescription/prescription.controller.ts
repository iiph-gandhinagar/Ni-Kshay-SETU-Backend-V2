/**
 * Controller responsible for handling prescription-related operations.
 *
 * This controller provides endpoints to retrieve and manage prescription data,
 * including fetching all generated prescriptions and generating prescription reports.
 * It is secured with authentication and permission guards and supports query-based
 * pagination, filtering, and sorting.
 *
 * @module PrescriptionController
 * @class
 * @decorator `@Controller('prescription')` - Defines the base route for this controller.
 * @decorator `@ApiTags('prescription')` - Tags the controller for Swagger documentation.
 * @decorator `@ApiBearerAuth('access-token')` - Indicates that the endpoints require a bearer token for authentication.
 * @decorator `@UseGuards(AdminAuthGuard, PermissionsGuard)` - Applies authentication and permission guards to all endpoints.
 * @decorator `@UsePipes(new ValidationPipe({ transform: true }))` - Enables validation and transformation of incoming requests.
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { PrescriptionService } from './prescription.service';

@ApiTags('prescription')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('prescription')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(PermissionsGuard)
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @ApiOperation({ summary: 'Get All Generated Prescription' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'diagnosis', required: false, type: String })
  @ApiQuery({ name: 'regimen', required: false, type: String })
  @ApiQuery({ name: 'prescription', required: false, type: String })
  @ApiQuery({ name: 'notes', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.prescriptionService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Generated Prescription' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'diagnosis', required: false, type: String })
  @ApiQuery({ name: 'regimen', required: false, type: String })
  @ApiQuery({ name: 'prescription', required: false, type: String })
  @ApiQuery({ name: 'notes', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('prescription-report')
  prescriptionReport(@Query() paginationDto: PaginationDto) {
    return this.prescriptionService.prescriptionReport(paginationDto);
  }
}
