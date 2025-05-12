/**
 * Controller for managing Master Institutes.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * Master Institutes. It also includes endpoints for fetching parent and child institute
 * details, as well as a list of institutes. The controller is secured with authentication
 * and permission guards to ensure only authorized users can access the endpoints.
 *
 * Features:
 * - Create a new Master Institute.
 * - Retrieve all Master Institutes with optional pagination and filtering.
 * - Retrieve a specific Master Institute by ID.
 * - Update a Master Institute by ID.
 * - Delete a Master Institute by ID.
 * - Fetch parent institute details based on role.
 * - Fetch child institute details for the logged-in user.
 * - Fetch a list of institutes.
 *
 * Security:
 * - Requires a valid access token for most endpoints.
 * - Uses `AdminAuthGuard` for authentication.
 * - Uses `PermissionsGuard` to enforce role-based access control.
 *
 * Decorators:
 * - `@ApiTags` for grouping endpoints in Swagger documentation.
 * - `@ApiOperation` for describing each endpoint's purpose.
 * - `@ApiQuery` for documenting query parameters.
 * - `@ApiBearerAuth` for indicating the need for a bearer token.
 * - `@UseGuards` for applying authentication and permission guards.
 * - `@Permissions` for specifying required permissions for each endpoint.
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
import { CreateMasterInstituteDto } from './dto/create-master-institute.dto';
import { UpdateMasterInstituteDto } from './dto/update-master-institute.dto';
import { MasterInstituteService } from './master-institute.service';

@ApiTags('master-institute')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('master-institute')
export class MasterInstituteController {
  constructor(
    private readonly masterInstituteService: MasterInstituteService,
  ) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Master Institute' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.create')
  @Post()
  create(
    @Body() createMasterInstituteDto: CreateMasterInstituteDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.masterInstituteService.create(createMasterInstituteDto, _id);
  }

  @ApiOperation({ summary: 'Get All Master Institute' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'countryId', required: false })
  @ApiQuery({ name: 'stateId', required: false })
  @ApiQuery({ name: 'districtId', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.masterInstituteService.findAll(paginationDto);
  }

  @Get('institute-list')
  findInstitute() {
    return this.masterInstituteService.findInstitute();
  }

  @ApiOperation({ summary: 'Get Parent Institute Details' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.index')
  @Get('get-parent-institute/:role')
  parentInstitute(@Param('role') role: string) {
    return this.masterInstituteService.parentInstitute(role);
  }

  @ApiOperation({ summary: 'Get Login User Child Institute Details' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.index')
  @Get('get-institute/:roleType')
  instituteList(@Param('roleType') roleType: string, @Req() request) {
    const { _id } = request.user;
    return this.masterInstituteService.instituteList(roleType, _id);
  }

  @ApiOperation({ summary: 'Get Master Institute by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterInstituteService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Master Institute by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterInstituteDto: UpdateMasterInstituteDto,
  ) {
    return this.masterInstituteService.update(id, updateMasterInstituteDto);
  }

  @ApiOperation({ summary: 'Delete Master Institute by id' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.master-institute.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterInstituteService.remove(id);
  }
}
