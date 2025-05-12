/**
 * Controller for managing static blogs.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting static blogs.
 * It includes both admin-protected routes and public routes for subscribers.
 *
 * Features:
 * - Admin-protected routes for managing blogs (create, update, delete, and retrieve by ID).
 * - Public routes for subscribers to retrieve blogs by slug or fetch similar blogs.
 * - Pagination and filtering support for retrieving blogs.
 * - Language-specific responses via the `lang` header.
 *
 * Decorators:
 * - `@ApiTags('static-blog')`: Groups the endpoints under the "static-blog" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Enables validation and transformation of incoming requests.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures that only authenticated admins can access certain routes.
 * - `PermissionsGuard`: Enforces permission-based access control for admin routes.
 *
 * Permissions:
 * - `admin.static-blog.create`: Required to create a new blog.
 * - `admin.static-blog.index`: Required to retrieve blogs.
 * - `admin.static-blog.edit`: Required to update a blog.
 * - `admin.static-blog.delete`: Required to delete a blog.
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
import { CreateStaticBlogDto } from './dto/create-static-blog.dto';
import { UpdateStaticBlogDto } from './dto/update-static-blog.dto';
import { StaticBlogService } from './static-blog.service';

@ApiTags('static-blog')
@ApiBearerAuth('access-token')
@Controller('static-blog')
@UsePipes(new ValidationPipe({ transform: true }))
export class StaticBlogController {
  constructor(private readonly staticBlogService: StaticBlogService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Blog' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-blog.create')
  @Post()
  create(@Body() createStaticBlogDto: CreateStaticBlogDto) {
    return this.staticBlogService.create(createStaticBlogDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Blog' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
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
  @Permissions('admin.static-blog.index')
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticBlogService.findAllBlogs(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get All Blog (subscriber)' })
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
  @Get('get-all-blogs')
  getAllBlogs(
    @Query() paginationDto: PaginationDto,
    @Headers('lang') lang: string,
  ) {
    return this.staticBlogService.findAll(paginationDto, lang);
  }

  @ApiOperation({ summary: 'Get Blog by slug(subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-blogs-by-slug/:slug')
  getBlogsBySlug(@Param('slug') slug: string, @Headers('lang') lang: string) {
    return this.staticBlogService.getBlogBySlug(slug, lang);
  }

  @ApiOperation({ summary: 'Get Blog by slug(subscriber)' })
  @Get('get-similar-blogs/:slug')
  getSimilarBlogs(@Param('slug') slug: string) {
    return this.staticBlogService.getSimilarBlogs(slug);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Blog by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-blog.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticBlogService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Blog by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-blog.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticBlogDto: UpdateStaticBlogDto,
  ) {
    return this.staticBlogService.update(id, updateStaticBlogDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Blog by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-blog.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticBlogService.remove(id);
  }
}
