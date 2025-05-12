/**
 * Controller responsible for managing District-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting districts. It also supports pagination, filtering, and sorting
 * for retrieving a list of districts.
 * ## Guards:
 * - `AdminAuthGuard`: Ensures that only authenticated admin users can access these endpoints.
 * - `PermissionsGuard`: Ensures that the user has the required permissions for each operation.
 *
 * ## Decorators:
 * - `@ApiTags('district')`: Groups the endpoints under the "district" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@Permissions`: Specifies the required permissions for each endpoint.
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
  Req,
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
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@ApiTags('district')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('district')
@UseGuards(PermissionsGuard)
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @ApiOperation({ summary: 'Create a new District' })
  @Permissions('admin.district.create')
  @Post()
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtService.create(createDistrictDto);
  }

  @ApiOperation({ summary: 'Get All District' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'stateCountry', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Permissions('admin.district.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.districtService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get District by id' })
  @Permissions('admin.district.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.districtService.findOne(id);
  }

  @ApiOperation({ summary: 'Update District by id' })
  @Permissions('admin.district.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDistrictDto: UpdateDistrictDto,
  ) {
    return this.districtService.update(id, updateDistrictDto);
  }

  @ApiOperation({ summary: 'Delete District by id' })
  @Permissions('admin.district.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.districtService.remove(id);
  }
}
