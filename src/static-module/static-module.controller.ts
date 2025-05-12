/**
 * Controller for managing static modules in the application.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting static modules. It includes both admin-protected routes
 * and public routes for fetching static module data. The controller
 * integrates with NestJS guards for authentication and authorization,
 * and uses validation pipes for request validation.
 *
 * Features:
 * - Create a new static module (Admin only).
 * - Retrieve all static modules with pagination and filtering options.
 * - Retrieve a static module by its slug (Public).
 * - Retrieve a static module by its ID (Admin only).
 * - Update a static module by its ID (Admin only).
 * - Delete a static module by its ID (Admin only).
 *
 * Decorators:
 * - `@ApiTags` for grouping endpoints in Swagger documentation.
 * - `@ApiBearerAuth` for indicating the use of bearer token authentication.
 * - `@UseGuards` for applying authentication and permission guards.
 * - `@ApiOperation`, `@ApiQuery`, and `@ApiHeader` for detailed Swagger documentation.
 *
 * Guards:
 * - `AdminAuthGuard` for admin authentication.
 * - `PermissionsGuard` for role-based access control.
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
import { CreateStaticModuleDto } from './dto/create-static-module.dto';
import { UpdateStaticModuleDto } from './dto/update-static-module.dto';
import { StaticModuleService } from './static-module.service';

@ApiTags('static-module')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-module')
export class StaticModuleController {
  constructor(private readonly staticModuleService: StaticModuleService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Module' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-module.create')
  @Post()
  create(@Body() createStaticModuleDto: CreateStaticModuleDto) {
    return this.staticModuleService.create(createStaticModuleDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Module' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-module.index')
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticModuleService.findAll(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get All Module (subscriber)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-static-module')
  getStaticModule(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticModuleService.findAll(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get Static Module by id' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-static-module/:slug')
  getStaticModuleBySlug(
    @Param('slug') slug: string,
    @Headers('lang') lang: string,
  ) {
    return this.staticModuleService.getStaticModuleBySlug(slug, lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Static Module by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-module.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticModuleService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Static Module by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-module.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticModuleDto: UpdateStaticModuleDto,
  ) {
    return this.staticModuleService.update(id, updateStaticModuleDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Static Module by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-module.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticModuleService.remove(id);
  }
}
