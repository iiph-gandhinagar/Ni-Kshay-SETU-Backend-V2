/**
 * Controller for managing Assessment Certificates.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting assessment certificates. It also includes functionality
 * for paginated retrieval and fetching all certificates.
 *
 * ## Guards and Permissions:
 * - Uses `AdminAuthGuard` to restrict access to authenticated admin users.
 * - Uses `PermissionsGuard` to enforce fine-grained permission checks for each endpoint.
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
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AssessmentCertificateService } from './assessment-certificate.service';
import { CreateAssessmentCertificateDto } from './dto/create-assessment-certificate.dto';
import { UpdateAssessmentCertificateDto } from './dto/update-assessment-certificate.dto';

@ApiTags('assessment-certificate')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('assessment-certificate')
export class AssessmentCertificateController {
  constructor(
    private readonly assessmentCertificateService: AssessmentCertificateService,
  ) {}

  @ApiOperation({ summary: 'Create a new Assessment Certificate' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.create')
  @Post()
  create(
    @Body() createAssessmentCertificateDto: CreateAssessmentCertificateDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.assessmentCertificateService.create(
      createAssessmentCertificateDto,
      _id,
    );
  }

  @ApiOperation({ summary: 'Get All Assessment' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.assessmentCertificateService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Assessment Certificate by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.index')
  @Get('get-all-certificates')
  findAllCertificate() {
    return this.assessmentCertificateService.findAllCertificate();
  }

  @ApiOperation({ summary: 'Get Assessment Certificate by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentCertificateService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Assessment Certificate by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssessmentCertificateDto: UpdateAssessmentCertificateDto,
  ) {
    return this.assessmentCertificateService.update(
      id,
      updateAssessmentCertificateDto,
    );
  }

  @ApiOperation({ summary: 'Delete Assessment Certificate by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.assessment-certificate.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentCertificateService.remove(id);
  }
}
