/**
 * Controller responsible for handling user app version-related operations.
 *
 * This controller provides endpoints for retrieving user app version data,
 * including paginated and non-paginated results. It is secured with guards
 * to ensure only authorized users can access the endpoints.
 *
 * @module UserAppVersionController
 */
import {
  Controller,
  Get,
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
import { UserAppVersionService } from './user-app-version.service';

@ApiTags('user-app-version')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('user-app-version')
export class UserAppVersionController {
  constructor(private readonly userAppVersionService: UserAppVersionService) {}

  @ApiOperation({ summary: 'Get All Admin User Activities' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.user-app-version.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'appVersion', required: false })
  @ApiQuery({ name: 'currentPlatform', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userAppVersionService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Admin User Activities without pagination' })
  @ApiQuery({ name: 'appVersion', required: false })
  @ApiQuery({ name: 'currentPlatform', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @Get('get-all-version')
  getAllUserVersion(@Query() paginationDto: PaginationDto) {
    return this.userAppVersionService.getAllUserVersion(paginationDto);
  }
}
