/**
 * Controller for managing Master CMS operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting Master CMS entries. It also includes a public endpoint
 * for fetching "About Us" content.
 *
 * Features:
 * - Public endpoint to retrieve "About Us" content.
 * - Protected endpoints for CRUD operations on Master CMS entries.
 * - Pagination, filtering, and sorting support for retrieving all entries.
 * - Uses `AdminAuthGuard` to secure protected endpoints.
 * - Input validation is enforced using `ValidationPipe`.
 *
 * Decorators:
 * - `@ApiTags('master-cms')`: Groups endpoints under the "master-cms" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that endpoints require a bearer token for authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { CreateMasterCmDto } from './dto/create-master-cm.dto';
import { UpdateMasterCmDto } from './dto/update-master-cm.dto';
import { MasterCmsService } from './master-cms.service';

@ApiTags('master-cms')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('master-cms')
export class MasterCmsController {
  constructor(private readonly masterCmsService: MasterCmsService) {}
  @ApiOperation({ summary: 'Get about us content' })
  @Get('get-about-us')
  findAboutUs() {
    return this.masterCmsService.findAboutUs();
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new Master CMS' })
  @Post()
  create(@Body() createMasterCmDto: CreateMasterCmDto) {
    return this.masterCmsService.create(createMasterCmDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get All Master CMS' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'description', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.masterCmsService.findAll(paginationDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Master CMS by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterCmsService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update Master CMS by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterCmDto: UpdateMasterCmDto,
  ) {
    return this.masterCmsService.update(id, updateMasterCmDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete Master CMS by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterCmsService.remove(id);
  }
}
