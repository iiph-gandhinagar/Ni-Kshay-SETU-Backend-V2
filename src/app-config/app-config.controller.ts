/**
 * Controller responsible for managing application configurations.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * application configuration records. It also includes endpoints for fetching configuration
 * details and language code details.
 *
 * Key Features:
 * - Create a new application configuration.
 * - Retrieve all application configurations with optional pagination and filtering.
 * - Retrieve specific configuration details based on language headers.
 * - Fetch language code details.
 * - Retrieve, update, and delete application configurations by ID.
 *
 * Guards and Permissions:
 * - AdminAuthGuard is used to protect most endpoints, ensuring only admins can access them.
 * - SubscriberAuthGuard is used for subscriber-specific endpoints.
 * - PermissionsGuard ensures that users have the required permissions to perform specific actions.
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
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AppConfigService } from './app-config.service';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';

@ApiTags('app-config')
@ApiBearerAuth('access-token')
@Controller('app-config')
@UsePipes(new ValidationPipe({ transform: true }))
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new App Config' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-config.create')
  @Post()
  create(@Body() createAppConfigDto: CreateAppConfigDto) {
    return this.appConfigService.create(createAppConfigDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All App Config' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'key', required: false })
  @ApiQuery({ name: 'value', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-config.index')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appConfigService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get configuration details' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-app-config-details')
  getConfiguration(@Headers('lang') lang: string) {
    return this.appConfigService.getConfiguration(lang);
  }

  @ApiOperation({ summary: 'Get language Code Details (AI)' })
  @Get('get-lang-code')
  getLangCode() {
    return this.appConfigService.getLangCode();
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get App Config by id' })
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-config.index')
  findOne(@Param('id') id: string) {
    return this.appConfigService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update App Config by id' })
  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-config.edit')
  update(
    @Param('id') id: string,
    @Body() updateAppConfigDto: UpdateAppConfigDto,
  ) {
    return this.appConfigService.update(id, updateAppConfigDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete App Config by id' })
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('admin.app-config.delete')
  remove(@Param('id') id: string) {
    return this.appConfigService.remove(id);
  }
}
