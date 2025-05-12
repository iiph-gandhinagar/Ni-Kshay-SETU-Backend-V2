/**
 * Controller responsible for managing App Management Flags.
 * Provides endpoints for creating, retrieving, updating, and deleting
 * app management flags, as well as checking the health status of an app.
 *
 * Features:
 * - Create a new app management flag.
 * - Retrieve all app management flags with pagination and filtering options.
 * - Retrieve a specific app management flag by ID.
 * - Update an app management flag by ID.
 * - Delete an app management flag by ID.
 * - Check the health status of an app with optional language header.
 *
 * Guards:
 * - Uses `AdminAuthGuard` to ensure only authenticated admin users can access.
 * - Uses `PermissionsGuard` to enforce specific permissions for each endpoint.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AppManagementFlagService } from './app-management-flag.service';
import { CheckHealthStatus } from './dto/check-health-status.dto';
import { CreateAppManagementFlagDto } from './dto/create-app-management-flag.dto';
import { UpdateAppManagementFlagDto } from './dto/update-app-management-flag.dto';

@ApiTags('app-management-flag')
@ApiBearerAuth('access-token')
@Controller('app-management-flag')
@UsePipes(new ValidationPipe({ transform: true }))
export class AppManagementFlagController {
  constructor(
    private readonly appManagementFlagService: AppManagementFlagService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new App Management' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-management.create')
  @Post()
  create(@Body() createAppManagementFlagDto: CreateAppManagementFlagDto) {
    return this.appManagementFlagService.create(createAppManagementFlagDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All App Management' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'variable', required: false })
  @ApiQuery({ name: 'value', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-management.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appManagementFlagService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Check Health Status of APP' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Post('check-health-status')
  getCheckHealthStatus(
    @Body() checkHealthStatus: CheckHealthStatus,
    @Headers('lang') lang: string,
  ) {
    const { appVersion, platform } = checkHealthStatus;
    return this.appManagementFlagService.getCheckHealthStatus(
      lang,
      appVersion,
      platform,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get App Management by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-management.create')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appManagementFlagService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update App Management by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-management.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppManagementFlagDto: UpdateAppManagementFlagDto,
  ) {
    return this.appManagementFlagService.update(id, updateAppManagementFlagDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete App Management by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-management.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appManagementFlagService.remove(id);
  }
}
