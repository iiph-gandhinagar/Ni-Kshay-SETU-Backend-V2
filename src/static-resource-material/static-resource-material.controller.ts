/**
 * Controller for managing static resource materials.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting static resource materials. It includes both admin-protected
 * routes and public routes for subscribers.
 *
 * Features:
 * - Create a new static resource material.
 * - Retrieve all static resource materials with optional pagination and search.
 * - Retrieve a specific static resource material by ID.
 * - Update a static resource material by ID.
 * - Delete a static resource material by ID.
 *
 * Guards:
 * - AdminAuthGuard: Ensures that only authenticated admin users can access certain routes.
 * - PermissionsGuard: Ensures that users have the required permissions to perform actions.
 *
 * Decorators:
 * - `@ApiTags`: Groups the endpoints under the "static-resource-material" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that the endpoints require a bearer token for authentication.
 * - `@ApiOperation`: Provides a summary of each endpoint's functionality.
 * - `@ApiQuery` and `@ApiHeader`: Document query parameters and headers for Swagger.
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
import { CreateStaticResourceMaterialDto } from './dto/create-static-resource-material.dto';
import { UpdateStaticResourceMaterialDto } from './dto/update-static-resource-material.dto';
import { StaticResourceMaterialService } from './static-resource-material.service';

@ApiTags('static-resource-material')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-resource-material')
export class StaticResourceMaterialController {
  constructor(
    private readonly staticResourceMaterialService: StaticResourceMaterialService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Resource material' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-resource-material.create')
  @Post()
  create(
    @Body() createStaticResourceMaterialDto: CreateStaticResourceMaterialDto,
  ) {
    return this.staticResourceMaterialService.create(
      createStaticResourceMaterialDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Resource material' })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-resource-material.index')
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticResourceMaterialService.findAll(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get All Resource material (Subscriber)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-static-resource-material')
  getStaticResourceMaterial(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticResourceMaterialService.findAll(paginationDto, lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Static Resource material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-resource-material.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticResourceMaterialService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Static Resource material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-resource-material.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticResourceMaterialDto: UpdateStaticResourceMaterialDto,
  ) {
    return this.staticResourceMaterialService.update(
      id,
      updateStaticResourceMaterialDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Static Resource Material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-resource-material.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticResourceMaterialService.remove(id);
  }
}
