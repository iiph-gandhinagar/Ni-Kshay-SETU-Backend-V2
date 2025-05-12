/**
 * Controller responsible for managing country-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting country records. It also supports pagination and search
 * functionality for listing countries.
 *
 * ## Guards and Permissions:
 * - Uses `AdminAuthGuard` and `PermissionsGuard` to secure endpoints.
 * - Requires specific permissions for each operation, such as:
 *   - `admin.country.create` for creating a country.
 *   - `admin.country.index` for retrieving a country by ID.
 *   - `admin.country.edit` for updating a country.
 *   - `admin.country.delete` for deleting a country.
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
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@ApiBearerAuth('access-token')
@ApiTags('country')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @ApiOperation({ summary: 'Create a new Country' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.country.create')
  @Post()
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Countries' })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.countryService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Country by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.country.index')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.countryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Country Detail' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.country.edit')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountryDto);
  }

  @ApiOperation({ summary: 'Delete Country Detail' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.country.delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.countryService.remove(id);
  }
}
