/**
 * Controller for managing states in the application.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting states.
 * It is protected by authentication and authorization guards, ensuring only authorized users
 * can access or modify state data. The controller also supports pagination, filtering, and sorting
 * for retrieving a list of states.
 *
 * Key Features:
 * - Create a new state.
 * - Retrieve all states with optional filters and pagination.
 * - Retrieve a specific state by its ID.
 * - Update a state by its ID.
 * - Delete a state by its ID.
 *
 * Decorators:
 * - `@ApiTags('state')`: Groups the endpoints under the "state" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AdminAuthGuard)`: Ensures that only authenticated admin users can access the endpoints.
 * - `@UsePipes(ValidationPipe)`: Automatically validates and transforms incoming request data.
 *
 * Authorization:
 * - Specific permissions are required for each endpoint, enforced using the `PermissionsGuard` and `@Permissions` decorator.
 *
 * Dependencies:
 * - `StateService`: Handles the business logic for state management.
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
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { StateService } from './state.service';

@ApiTags('state')
@Controller('state')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @ApiOperation({ summary: 'Create a new State' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.state.create')
  @Post()
  create(@Body() createStateDto: CreateStateDto) {
    return this.stateService.create(createStateDto);
  }

  @ApiOperation({ summary: 'Get All States' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'stateCountry', required: false })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.state.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.stateService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get State by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.state.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stateService.findOne(id);
  }
  @ApiOperation({ summary: 'Update State by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.state.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.stateService.update(id, updateStateDto);
  }

  @ApiOperation({ summary: 'Delete State by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.state.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stateService.remove(id);
  }
}
