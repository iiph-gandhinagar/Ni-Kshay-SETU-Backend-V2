/**
 * Controller responsible for managing Cadre-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting Cadres. It also supports pagination, filtering, and sorting
 * for retrieving a list of Cadres.
 *
 * ## Guards:
 * - `AdminAuthGuard`: Ensures that only authenticated admin users can access these endpoints.
 * - `PermissionsGuard`: Ensures that users have the required permissions to perform specific actions.
 *
 * ## Pipes:
 * - `ValidationPipe`: Automatically validates and transforms incoming request data.
 *
 * ## Decorators:
 * - `@ApiTags('cadre')`: Groups the endpoints under the "cadre" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@Permissions`: Specifies the required permissions for each endpoint.
 * - `@ApiOperation`: Provides a summary of each endpoint's functionality.
 * - `@ApiQuery`: Documents query parameters for endpoints that support filtering, pagination, or sorting.
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
import { CadreService } from './cadre.service';
import { CreateCadreDto } from './dto/create-cadre.dto';
import { UpdateCadreDto } from './dto/update-cadre.dto';

@ApiTags('cadre')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('cadre')
@UseGuards(PermissionsGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class CadreController {
  constructor(private readonly cadreService: CadreService) {}

  @ApiOperation({ summary: 'Create a new Cadre' })
  @Permissions('admin.cadre.create')
  @Post()
  create(@Body() createCadreDto: CreateCadreDto) {
    return this.cadreService.create(createCadreDto);
  }

  @ApiOperation({ summary: 'Get All Cadres' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'cadreTypes', required: false, type: [String] })
  @ApiQuery({ name: 'cadreGroup', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Permissions('admin.cadre.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cadreService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Cadre by id' })
  @Permissions('admin.cadre.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cadreService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Cadre by id' })
  @Permissions('admin.cadre.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCadreDto: UpdateCadreDto) {
    return this.cadreService.update(id, updateCadreDto);
  }

  @ApiOperation({ summary: 'Delete Cadre by id' })
  @Permissions('admin.cadre.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cadreService.remove(id);
  }
}
