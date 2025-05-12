/**
 * Controller responsible for managing Health Facility operations.
 *
 * This controller provides endpoints to create, retrieve, update, and delete health facilities.
 * It also supports pagination, filtering, and sorting for retrieving multiple health facilities.
 *
 * ## Guards and Permissions:
 * - Uses `AdminAuthGuard` to ensure only authenticated admin users can access these endpoints.
 * - Uses `PermissionsGuard` to enforce fine-grained permissions for each operation.
 *
 * ## Validation:
 * - Applies `ValidationPipe` globally to validate and transform incoming request data.
 *
 * ## Swagger Documentation:
 * - Annotated with Swagger decorators to generate API documentation, including query parameters, request bodies, and response details.
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
import { CreateHealthFacilityDto } from './dto/create-health-facility.dto';
import { UpdateHealthFacilityDto } from './dto/update-health-facility.dto';
import { HealthFacilityService } from './health-facility.service';

@ApiTags('health-facility')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('health-facility')
export class HealthFacilityController {
  constructor(private readonly healthFacilityService: HealthFacilityService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('admin.health-facility.create')
  @ApiOperation({ summary: 'Create a new Health Facility' })
  @Post()
  create(@Body() createHealthFacilityDto: CreateHealthFacilityDto) {
    return this.healthFacilityService.create(createHealthFacilityDto);
  }

  @ApiOperation({ summary: 'Get All Health Facility' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'stateCountry', required: false })
  @ApiQuery({ name: 'healthFacilityCode', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'blockId', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.health-facility.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.healthFacilityService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get Health Facility Details by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.health-facility.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthFacilityService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Health Facility by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.health-facility.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHealthFacilityDto: UpdateHealthFacilityDto,
  ) {
    return this.healthFacilityService.update(id, updateHealthFacilityDto);
  }

  @ApiOperation({ summary: 'Delete Health Facility by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.health-facility.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthFacilityService.remove(id);
  }
}
