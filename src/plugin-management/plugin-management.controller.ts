/**
 * Controller responsible for managing plugin-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting plugin management records. It is secured with an
 * AdminAuthGuard and uses a ValidationPipe to validate and transform
 * incoming requests.
 *
 * @module PluginManagementController
 * @description Handles plugin management operations such as creation,
 * retrieval, updating, and deletion of plugin management entities.
 *
 * @class PluginManagementController
 * @constructor
 * @param {PluginManagementService} pluginManagementService - Service to handle business logic for plugin management.
 *
 * @decorator `@ApiTags('plugin-management')` - Groups the controller under the "plugin-management" tag in Swagger documentation.
 * @decorator `@ApiBearerAuth('access-token')` - Indicates that the controller requires a bearer token for authentication.
 * @decorator `@UseGuards(AdminAuthGuard)` - Protects the controller with an admin authentication guard.
 * @decorator `@UsePipes(new ValidationPipe({ transform: true }))` - Applies validation and transformation to incoming requests.
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
import { CreatePluginManagementDto } from './dto/create-plugin-management.dto';
import { UpdatePluginManagementDto } from './dto/update-plugin-management.dto';
import { PluginManagementService } from './plugin-management.service';

@ApiTags('plugin-management')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('plugin-management')
export class PluginManagementController {
  constructor(
    private readonly pluginManagementService: PluginManagementService,
  ) {}

  @ApiOperation({ summary: 'Create a new Plugin management' })
  @Post()
  create(@Body() createPluginManagementDto: CreatePluginManagementDto) {
    return this.pluginManagementService.create(createPluginManagementDto);
  }

  @ApiOperation({ summary: 'Get All Plugin management' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pluginManagementService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Plugin management by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pluginManagementService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Plugin management by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePluginManagementDto: UpdatePluginManagementDto,
  ) {
    return this.pluginManagementService.update(id, updatePluginManagementDto);
  }

  @ApiOperation({ summary: 'Delete Plugin management by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pluginManagementService.remove(id);
  }
}
