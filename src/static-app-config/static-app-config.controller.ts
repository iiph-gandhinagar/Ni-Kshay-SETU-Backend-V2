/**
 * Controller for managing Static Web App Configurations.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * static web app configurations. It also includes a public endpoint for retrieving
 * configurations without pagination, intended for subscribers.
 * ## Guards and Permissions:
 * - AdminAuthGuard is used to restrict access to admin-only endpoints.
 * - PermissionsGuard is used to enforce fine-grained permission checks for each operation.
 *
 * ## Decorators:
 * - `@ApiTags`: Categorizes the controller under the "static-app-config" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that endpoints require an access token for authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery` and `@ApiHeader`: Document query parameters and headers for specific endpoints.
 *
 * @module StaticAppConfigController
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
import { CreateStaticAppConfigDto } from './dto/create-static-app-config.dto';
import { UpdateStaticAppConfigDto } from './dto/update-static-app-config.dto';
import { StaticAppConfigService } from './static-app-config.service';

@ApiTags('static-app-config')
@ApiBearerAuth('access-token')
@Controller('static-app-config')
@UsePipes(new ValidationPipe({ transform: true }))
export class StaticAppConfigController {
  constructor(
    private readonly staticAppConfigService: StaticAppConfigService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Static Web App Config' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-app-config.create')
  @Post()
  create(@Body() createStaticAppConfigDto: CreateStaticAppConfigDto) {
    return this.staticAppConfigService.create(createStaticAppConfigDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Static Web App Config' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'key', required: false })
  @ApiQuery({ name: 'value', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-app-config.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticAppConfigService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Static Web App Config (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-static-app-config')
  getStaticAppConfig(@Headers('lang') lang: string) {
    return this.staticAppConfigService.findAllWithoutPagination(lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Static Web App Config by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-app-config.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticAppConfigService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Static Web App Config by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-app-config.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticAppConfigDto: UpdateStaticAppConfigDto,
  ) {
    return this.staticAppConfigService.update(id, updateStaticAppConfigDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Static Web App Config by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-app-config.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticAppConfigService.remove(id);
  }
}
