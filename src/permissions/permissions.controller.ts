/**
 * PermissionsController handles all operations related to permissions management.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting permissions.
 * It is protected by authentication and authorization guards to ensure only authorized users can access its methods.
 * ## Guards:
 * - `AdminAuthGuard`: Ensures the user is authenticated as an admin.
 * - `PermissionsGuard`: Ensures the user has the required permissions for the operation.
 *
 * ## Decorators:
 * - `@Permissions`: Specifies the required permission for the endpoint.
 * - `@ApiOperation`: Provides a summary of the endpoint for Swagger documentation.
 * - `@ApiQuery`: Defines query parameters for endpoints that support filtering or pagination.
 * - `@ApiBearerAuth`: Indicates the use of bearer token authentication.
 *
 * ## Error Handling:
 * - Throws `HttpException` with appropriate HTTP status codes for validation errors or internal server errors.
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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Create a new permission' })
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.create')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.index')
  @ApiOperation({ summary: 'Get All Permission' })
  @Get('master-permission')
  async findAllPermissions() {
    return this.permissionsService.findAllPermission();
  }

  @ApiOperation({ summary: 'Get all permissions' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.index')
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'moduleName', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.permissionsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get permissions by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.edit')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.permissionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update permissions by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.edit')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      return await this.permissionsService.update(id, updatePermissionDto);
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

  @ApiOperation({ summary: 'Delete permissions by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.permission.delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.permissionsService.remove(id);
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
