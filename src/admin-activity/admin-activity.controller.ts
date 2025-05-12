/* This controller is responsible for capturing and recording admin activities such as create, update, and delete operations. */
import {
  Body,
  Controller,
  Get,
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { AdminActivityService } from './admin-activity.service';
import { CreateAdminActivityDto } from './dto/create-admin-activity.dto';

@ApiTags('admin-activity')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('admin-activity')
export class AdminActivityController {
  constructor(private readonly adminActivityService: AdminActivityService) {}

  @ApiOperation({ summary: 'Create a new Admin Activity' })
  @Post()
  create(
    @Body() createAdminActivityDto: CreateAdminActivityDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.adminActivityService.create(createAdminActivityDto, _id);
  }

  @ApiOperation({ summary: 'Get All Admin User Activities' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'moduleName', required: false })
  @ApiQuery({ name: 'causerId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.adminActivityService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get All Admin User Activities without pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'moduleName', required: false })
  @ApiQuery({ name: 'causerId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get('get-all-activity')
  getAllActivity(@Query() paginationDto: PaginationDto) {
    return this.adminActivityService.getAllActivity(paginationDto);
  }
}
