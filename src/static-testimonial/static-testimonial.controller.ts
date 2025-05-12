/**
 * Controller for managing static testimonials.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * static testimonials. It is protected by authentication and authorization guards
 * to ensure only authorized users can access or modify the data.
 * ## Decorators:
 * - `@ApiTags('static-testimonial')`: Groups the endpoints under the "static-testimonial" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AdminAuthGuard, PermissionsGuard)`: Protects the endpoints with authentication and permissions guards.
 * - `@UsePipes(ValidationPipe)`: Automatically validates and transforms incoming request data.
 *
 * ## Permissions:
 * - `admin.static-testimonial.create`: Required to create a new static testimonial.
 * - `admin.static-testimonial.index`: Required to retrieve static testimonials.
 * - `admin.static-testimonial.edit`: Required to update a static testimonial.
 * - `admin.static-testimonial.delete`: Required to delete a static testimonial.
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
import { CreateStaticTestimonialDto } from './dto/create-static-testimonial.dto';
import { UpdateStaticTestimonialDto } from './dto/update-static-testimonial.dto';
import { StaticTestimonialService } from './static-testimonial.service';

@ApiTags('static-testimonial')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('static-testimonial')
export class StaticTestimonialController {
  constructor(
    private readonly staticTestimonialService: StaticTestimonialService,
  ) {}

  @ApiOperation({ summary: 'Create a new Static Testimonial' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-testimonial.create')
  @Post()
  create(@Body() createStaticTestimonialDto: CreateStaticTestimonialDto) {
    return this.staticTestimonialService.create(createStaticTestimonialDto);
  }

  @ApiOperation({ summary: 'Get All Static Testimonial' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-testimonial.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticTestimonialService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Static Testimonial by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-testimonial.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticTestimonialService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Static Testimonial by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-testimonial.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticTestimonialDto: UpdateStaticTestimonialDto,
  ) {
    return this.staticTestimonialService.update(id, updateStaticTestimonialDto);
  }

  @ApiOperation({ summary: 'Delete Static Testimonial by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-testimonial.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticTestimonialService.remove(id);
  }
}
