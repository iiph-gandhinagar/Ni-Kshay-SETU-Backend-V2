/**
 * Controller for managing static FAQs.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting FAQs.
 * It includes both admin-protected routes and public routes for accessing FAQs.
 *
 * Features:
 * - Create a new FAQ (Admin only).
 * - Retrieve all FAQs with pagination and filtering options (Admin only).
 * - Retrieve all FAQs without pagination for subscribers.
 * - Retrieve a specific FAQ by ID (Admin only).
 * - Update a specific FAQ by ID (Admin only).
 * - Delete a specific FAQ by ID (Admin only).
 *
 * Guards:
 * - AdminAuthGuard: Ensures only authenticated admins can access certain routes.
 * - PermissionsGuard: Ensures admins have the required permissions for specific actions.
 *
 * Decorators:
 * - `@ApiTags`: Groups the endpoints under the "static-faq" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that the endpoints require an access token for authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery`: Documents query parameters for endpoints that support filtering and pagination.
 * - `@ApiHeader`: Documents custom headers required by specific endpoints.
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
import { CreateStaticFaqDto } from './dto/create-static-faq.dto';
import { UpdateStaticFaqDto } from './dto/update-static-faq.dto';
import { StaticFaqService } from './static-faq.service';

@ApiTags('static-faq')
@ApiBearerAuth('access-token')
@Controller('static-faq')
@UsePipes(new ValidationPipe({ transform: true }))
export class StaticFaqController {
  constructor(private readonly staticFaqService: StaticFaqService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new FAQ' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-faq.create')
  @Post()
  create(@Body() createStaticFaqDto: CreateStaticFaqDto) {
    return this.staticFaqService.create(createStaticFaqDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All FAQ' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'questions', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-faq.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.staticFaqService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get FAQ without pagination (subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-all-faq')
  findAllWithoutPagination(@Headers('lang') lang: string) {
    return this.staticFaqService.findAllWithoutPagination(lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get FAQ by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-faq.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staticFaqService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update FAQ by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-faq.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaticFaqDto: UpdateStaticFaqDto,
  ) {
    return this.staticFaqService.update(id, updateStaticFaqDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete FAQ by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.static-faq.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staticFaqService.remove(id);
  }
}
