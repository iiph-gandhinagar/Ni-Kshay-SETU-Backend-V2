/**
 * RolesController is responsible for handling HTTP requests related to roles management.
 * It provides endpoints for creating, retrieving, updating, and deleting roles.
 *
 * This controller uses NestJS decorators for routing, validation, and authorization.
 * It also integrates with Swagger for API documentation.
 *
 * Key Features:
 * - Create a new role
 * - Retrieve all roles with optional pagination and filtering
 * - Retrieve a specific role by ID
 * - Update a role by ID
 * - Delete a role by ID
 *
 * Guards:
 * - AdminAuthGuard: Ensures that only authenticated admin users can access certain endpoints.
 * - PermissionsGuard: Validates user permissions for specific actions.
 *
 * Decorators:
 * - @Permissions: Specifies the required permission for accessing an endpoint.
 * - @ApiOperation: Provides a summary for Swagger documentation.
 * - @ApiQuery: Documents query parameters for Swagger.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { ValidationError } from 'class-validator';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiBearerAuth('access-token')
@ApiTags('roles')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.role.create')
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get All roles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.role.index')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.rolesService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Roles' })
  @Get('get-all-roles')
  async findAllRole() {
    return await this.rolesService.findAllRole();
  }

  @ApiOperation({ summary: 'Get roles by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update roles by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.role.edit')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    try {
      return await this.rolesService.update(id, updateRoleDto);
    } catch (error) {
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete roles by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.role.delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.rolesService.remove(id);
    } catch (error) {
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
