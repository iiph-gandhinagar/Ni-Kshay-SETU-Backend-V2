/**
 * Controller responsible for managing Tour-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting tours. It also includes functionality for retrieving tours
 * with slides and supports pagination for listing tours.
 *
 * ## Guards and Permissions:
 * - Uses `AdminAuthGuard` to restrict access to admin users.
 * - Uses `PermissionsGuard` to enforce fine-grained permission checks.
 * - Permissions include:
 *   - `admin.tour.create` for creating tours.
 *   - `admin.tour.index` for listing and retrieving tours.
 *   - `admin.tour.edit` for updating tours.
 *   - `admin.tour.delete` for deleting tours.

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
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourService } from './tour.service';

@ApiTags('tour')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Tour' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.tour.create')
  @Post()
  create(@Body() createTourDto: CreateTourDto) {
    return this.tourService.create(createTourDto);
  }

  @ApiOperation({ summary: 'Get Tour Without Pagination' })
  @Get('get-active-tour')
  tourWithTourSlides() {
    return this.tourService.tourWithTourSlides();
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Tours' })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.tour.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tourService.findAll(paginationDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Tour by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.tour.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Tour by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.tour.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.tourService.update(id, updateTourDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Tour by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.tour.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tourService.remove(id);
  }
}
