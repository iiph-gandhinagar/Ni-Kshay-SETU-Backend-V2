/**
 * Controller for managing Static Key Features.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * static key features. It also includes an endpoint for fetching homepage data
 * based on a specified language.

 * ## Guards and Permissions:
 * - Most endpoints are protected by `AdminAuthGuard` and `PermissionsGuard`.
 * - Permissions are required for specific actions, such as creating
 *
 * @module StaticKeyFeatureController
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
import { CreateStaticKeyFeatureDto } from './dto/create-static-key-feature.dto';
import { UpdateStaticKeyFeatureDto } from './dto/update-static-key-feature.dto';
import { StaticKeyFeatureService } from './static-key-feature.service';

@ApiTags('static-key-feature')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-key-feature')
export class StaticKeyFeatureController {
  constructor(
    private readonly staticKeyFeatureService: StaticKeyFeatureService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Static Key Feature' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-key-feature.create')
  @Post()
  create(@Body() createStaticKeyFeatureDto: CreateStaticKeyFeatureDto) {
    return this.staticKeyFeatureService.create(createStaticKeyFeatureDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Static key Feature' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-key-feature.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticKeyFeatureService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Static Key Feature by id' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-web-home-page')
  getHomePageData(@Headers('lang') lang: string) {
    return this.staticKeyFeatureService.getHomePageData(lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Static Key Feature by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-key-feature.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticKeyFeatureService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Static Key Feature by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-key-feature.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticKeyFeatureDto: UpdateStaticKeyFeatureDto,
  ) {
    return this.staticKeyFeatureService.update(id, updateStaticKeyFeatureDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Static Key Feature by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-key-feature.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticKeyFeatureService.remove(id);
  }
}
