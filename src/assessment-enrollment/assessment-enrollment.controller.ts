/**
 * Controller responsible for handling operations related to assessment enrollments.
 *
 * This controller provides endpoints for:
 * - Retrieving all assessment enrollment details with optional filters and pagination.
 * - Updating an assessment enrollment by its ID.
 *
 * It uses guards to enforce authentication and authorization:
 * - `AdminAuthGuard` and `PermissionsGuard` for admin-specific operations.
 * - `SubscriberAuthGuard` for subscriber-specific operations.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AssessmentEnrollmentService } from './assessment-enrollment.service';
import { UpdateAssessmentEnrollmentDto } from './dto/update-assessment-enrollment.dto';

@ApiTags('assessment-enrollment')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('assessment-enrollment')
export class AssessmentEnrollmentController {
  constructor(
    private readonly assessmentEnrollmentService: AssessmentEnrollmentService,
  ) {}

  @ApiOperation({ summary: 'Get All Assessment Enrollment details' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'assessmentId', required: false })
  @ApiQuery({ name: 'subscriber', required: false })
  @ApiQuery({ name: 'response', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-enrollment.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.assessmentEnrollmentService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Update Assessment by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssessmentEnrollmentDto: UpdateAssessmentEnrollmentDto,
  ) {
    return this.assessmentEnrollmentService.update(
      id,
      updateAssessmentEnrollmentDto,
    );
  }
}
