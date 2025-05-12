/**
 * Controller for managing Primary Cadres.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * primary cadre records. It includes support for pagination, filtering, and sorting
 * when retrieving multiple records. The controller is secured with guards to ensure
 * that only authorized users can access its endpoints.
 * ## Security:
 * - Protected by `AdminAuthGuard` to ensure only authenticated admin users can access.
 * - Uses `PermissionsGuard` to enforce fine-grained permission checks for each endpoint.
 *
 * ## Validation:
 * - Uses `ValidationPipe` to validate and transform incoming request data.
 *
 * ## Decorators:
 * - `@ApiTags`: Groups the endpoints under the "primary-cadre" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that endpoints require an access token for authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery`: Documents query parameters for endpoints that support filtering and pagination.
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreatePrimaryCadreDto } from './dto/create-primary-cadre.dto';
import { UpdatePrimaryCadreDto } from './dto/update-primary-cadre.dto';
import { PrimaryCadreService } from './primary-cadre.service';

@ApiTags('primary-cadre')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('primary-cadre')
export class PrimaryCadreController {
  constructor(private readonly primaryCadreService: PrimaryCadreService) {}

  @ApiOperation({ summary: 'Create a new Primary cadre' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.primary-cadre.create')
  @Post()
  create(@Body() createPrimaryCadreDto: CreatePrimaryCadreDto) {
    return this.primaryCadreService.create(createPrimaryCadreDto);
  }

  @ApiOperation({ summary: 'Get All Primary cadre' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.primary-cadre.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.primaryCadreService.findAll(paginationDto);
  }

  @Get('get-all-primary-cadre')
  getAllPrimaryCadres() {
    return this.primaryCadreService.getAllPrimaryCadres();
  }

  @ApiOperation({ summary: 'Get Primary cadre by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.primary-cadre.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.primaryCadreService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Primary cadre by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.primary-cadre.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrimaryCadreDto: UpdatePrimaryCadreDto,
  ) {
    return this.primaryCadreService.update(id, updatePrimaryCadreDto);
  }

  @ApiOperation({ summary: 'Delete Primary Cadre by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.primary-cadre.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.primaryCadreService.remove(id);
  }
}
