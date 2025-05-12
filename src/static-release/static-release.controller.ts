/**
 * Controller responsible for managing static releases.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting static releases.
 * It includes both admin-protected routes and public routes for subscribers.
 *
 * Features:
 * - Create a new static release.
 * - Retrieve all static releases with optional pagination, sorting, and filtering.
 * - Retrieve a specific static release by its ID.
 * - Update a static release by its ID.
 * - Delete a static release by its ID.
 *
 * Guards:
 * - AdminAuthGuard: Ensures that only authenticated admin users can access certain routes.
 * - PermissionsGuard: Ensures that users have the required permissions to perform specific actions.
 *
 * Decorators:
 * - `@ApiTags`: Groups the endpoints under the "static-release" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Specifies that the endpoints require an access token for authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery` and `@ApiHeader`: Define query parameters and headers for the endpoints in Swagger documentation.
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
import { CreateStaticReleaseDto } from './dto/create-static-release.dto';
import { UpdateStaticReleaseDto } from './dto/update-static-release.dto';
import { StaticReleaseService } from './static-release.service';

@ApiTags('static-release')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-release')
export class StaticReleaseController {
  constructor(private readonly staticReleaseService: StaticReleaseService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Release' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-release.create')
  @Post()
  create(@Body() createStaticReleaseDto: CreateStaticReleaseDto) {
    return this.staticReleaseService.create(createStaticReleaseDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Releases Detail' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'feature', required: false })
  @ApiQuery({ name: 'bug', required: false })
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
  @Permissions('admin.static-release.index')
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticReleaseService.findAllReleases(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get All Releases Detail (subscriber)' })
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
  @Get('get-static-release')
  getAllStaticRelease(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticReleaseService.findAll(paginationDto, lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Release by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-release.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticReleaseService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Release by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-release.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticReleaseDto: UpdateStaticReleaseDto,
  ) {
    return this.staticReleaseService.update(id, updateStaticReleaseDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Release by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-release.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticReleaseService.remove(id);
  }
}
