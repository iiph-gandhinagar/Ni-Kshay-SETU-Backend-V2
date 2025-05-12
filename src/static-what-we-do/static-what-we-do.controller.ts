/**
 * Controller for managing "What We Do" static content.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting "What We Do" entries. It includes features such as
 * pagination, filtering, and sorting for retrieving multiple entries.
 *
 * ## Endpoints:
 * - **POST /static-what-we-do**: Create a new "What We Do" entry.
 * - **GET /static-what-we-do**: Retrieve all "What We Do" entries with optional pagination, filtering, and sorting.
 * - **GET /static-what-we-do/:id**: Retrieve a specific "What We Do" entry by its ID.
 * - **PATCH /static-what-we-do/:id**: Update a specific "What We Do" entry by its ID.
 * - **DELETE /static-what-we-do/:id**: Delete a specific "What We Do" entry by its ID.
 *
 * ## Guards and Permissions:
 * - Protected by `AdminAuthGuard` to ensure only authenticated admin users can access.
 * - Uses `PermissionsGuard` to enforce fine-grained permission checks for each endpoint.
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
import { CreateStaticWhatWeDoDto } from './dto/create-static-what-we-do.dto';
import { UpdateStaticWhatWeDoDto } from './dto/update-static-what-we-do.dto';
import { StaticWhatWeDoService } from './static-what-we-do.service';

@ApiTags('static-what-we-do')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-what-we-do')
export class StaticWhatWeDoController {
  constructor(private readonly staticWhatWeDoService: StaticWhatWeDoService) {}

  @ApiOperation({ summary: 'Create a new What We Do' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-what-we-do.create')
  @Post()
  create(@Body() createStaticWhatWeDoDto: CreateStaticWhatWeDoDto) {
    return this.staticWhatWeDoService.create(createStaticWhatWeDoDto);
  }

  @ApiOperation({ summary: 'Get All What we do' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-what-we-do.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticWhatWeDoService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get What We do by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-what-we-do.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticWhatWeDoService.findOne(id);
  }

  @ApiOperation({ summary: 'Update What we do by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-what-we-do.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticWhatWeDoDto: UpdateStaticWhatWeDoDto,
  ) {
    return this.staticWhatWeDoService.update(id, updateStaticWhatWeDoDto);
  }

  @ApiOperation({ summary: 'Delete What We Do by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-what-we-do.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticWhatWeDoService.remove(id);
  }
}
