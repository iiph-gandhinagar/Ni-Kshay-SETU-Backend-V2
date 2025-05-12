/**
 * Controller for managing leaderboard levels, badges, and tasks.
 *
 * This controller provides endpoints for CRUD operations on leaderboard levels,
 * badges, and task lists. It includes functionality for creating, updating,
 * retrieving, and deleting these entities, as well as additional features like
 * pagination, filtering, and sorting.
 *
 * ## Features:
 * - **Leaderboard Levels**: Create, list, retrieve, update, and delete leaderboard levels.
 * - **Badges**: Manage badges associated with leaderboard levels.
 * - **Task Lists**: Handle tasks associated with badges and levels.
 * - **Subscriber Access**: Provide grouped task lists for subscribers.
 *
 * ## Guards and Permissions:
 * - Uses `AdminAuthGuard` and `PermissionsGuard` to restrict access to admin-specific endpoints.
 * - Uses `SubscriberAuthGuard` for subscriber-specific endpoints.
 * - Permissions are enforced using the `@Permissions` decorator.
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import {
  CreateBadgeDto,
  CreateLeaderBoardLevelDto,
  CreateTaskDto,
  UpdateBadgeDto,
  UpdateLeaderBoardLevelDto,
  UpdateTaskDto,
} from './dto/leader-board.dto';
import { LeaderBoardService } from './leader-board.service';

@ApiTags('Leaderboard Levels')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('leader-board')
export class LeaderBoardController {
  constructor(private readonly leaderBoardService: LeaderBoardService) {}

  //*********** Level CRUD **********//
  @Post('level/create')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-level.create')
  @ApiOperation({ summary: 'Create a new leaderboard level' })
  @ApiResponse({ status: 201, description: 'Level successfully created.' })
  createLevel(@Body() createDto: CreateLeaderBoardLevelDto) {
    return this.leaderBoardService.createLevel(createDto);
  }

  @Get('level/list')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-level.index')
  @ApiOperation({
    summary: 'Get all leaderboard levels with pagination and filters',
  })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'content', required: false })
  @ApiQuery({ name: 'index', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of leaderboard levels.' })
  findAllLevel(
    @Query() paginationDto: PaginationDto,
    @Query('isDrpDwn') isDrpDwn: boolean,
  ) {
    return this.leaderBoardService.findAllLevel(paginationDto, isDrpDwn);
  }

  @Get('level/detail/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-level.show')
  @ApiOperation({ summary: 'Get a leaderboard level by ID' })
  @ApiResponse({ status: 200, description: 'Level details.' })
  findOneLevel(@Param('id') id: string) {
    return this.leaderBoardService.findOneLevel(id);
  }

  @Patch('level/update/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-level.edit')
  @ApiOperation({ summary: 'Update a leaderboard level' })
  @ApiResponse({ status: 200, description: 'Level successfully updated.' })
  updateLevel(
    @Param('id') id: string,
    @Body() updateDto: UpdateLeaderBoardLevelDto,
  ) {
    return this.leaderBoardService.updateLevel(id, updateDto);
  }

  @Delete('level/delete/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-level.delete')
  @ApiOperation({ summary: 'Delete a leaderboard level' })
  @ApiResponse({ status: 200, description: 'Level successfully deleted.' })
  removeLevel(@Param('id') id: string) {
    return this.leaderBoardService.removeLevel(id);
  }

  //*********** Badge CRUD **********//
  @Post('badge/create')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-badge.create')
  @ApiOperation({ summary: 'Create a new leaderboard badge' })
  @ApiResponse({ status: 201, description: 'Badge created successfully.' })
  create(@Body() badgeData: CreateBadgeDto) {
    return this.leaderBoardService.createBadge(badgeData);
  }

  @Get('badge/list')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-badge.index')
  @ApiOperation({
    summary: 'Get all badges with pagination, filters, and global search',
  })
  @ApiResponse({ status: 200, description: 'List of leaderboard badges.' })
  @ApiQuery({ name: 'badge', required: false })
  @ApiQuery({ name: 'levelId', required: false })
  @ApiQuery({ name: 'index', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of leaderboard badges.' })
  findAllBadge(
    @Query() paginationDto: PaginationDto,
    @Query('isDrpDwn') isDrpDwn: boolean,
  ) {
    return this.leaderBoardService.findAllBadge(paginationDto, isDrpDwn);
  }

  @Get('badge/detail/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-badge.show')
  @ApiOperation({ summary: 'Get a specific badge by ID' })
  @ApiResponse({ status: 200, description: 'Badge details.' })
  findOneBadge(@Param('id') id: string) {
    return this.leaderBoardService.findOneBadge(id);
  }

  @Patch('badge/update/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-badge.edit')
  @ApiOperation({ summary: 'Update a specific badge by ID' })
  @ApiResponse({ status: 200, description: 'Badge updated successfully.' })
  updateBadge(@Param('id') id: string, @Body() updateData: UpdateBadgeDto) {
    return this.leaderBoardService.updateBadge(id, updateData);
  }

  @Delete('badge/delete/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-badge.delete')
  @ApiOperation({ summary: 'Delete a specific badge by ID' })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully.' })
  deleteBadge(@Param('id') id: string) {
    return this.leaderBoardService.deleteBadge(id);
  }

  //*********** Task list CRUD **********//
  @Post('task/create')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-task-list.create')
  @ApiOperation({ summary: 'Create a new task list' })
  @ApiResponse({ status: 201, description: 'Task list created successfully.' })
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.leaderBoardService.createTask(createTaskDto);
  }

  @Patch('task/update/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-task-list.edit')
  @ApiOperation({ summary: 'Update an existing task list' })
  @ApiResponse({ status: 200, description: 'Task list updated successfully.' })
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.leaderBoardService.updateTask(id, updateTaskDto);
  }
  @Get('task/detail/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-task-list.show')
  @ApiOperation({ summary: 'Get a specific badge by ID' })
  @ApiResponse({ status: 200, description: 'Badge details.' })
  findOneTask(@Param('id') id: string) {
    return this.leaderBoardService.findOneTask(id);
  }

  @Get('task-list/list')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-task-list.list')
  @ApiOperation({ summary: 'Get all task lists with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'levelId', required: false, type: String })
  @ApiQuery({ name: 'badgeId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Task lists retrieved successfully.',
  })
  findAllTask(@Query() paginationDto: PaginationDto) {
    return this.leaderBoardService.findAllTask(paginationDto);
  }

  @Delete('task/delete/:id')
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.lb-task-list.delete')
  @ApiOperation({ summary: 'Delete a task list by ID' })
  @ApiResponse({ status: 200, description: 'Task list deleted successfully.' })
  deleteTask(@Param('id') id: string) {
    return this.leaderBoardService.deleteTask(id);
  }

  @UseGuards(SubscriberAuthGuard)
  @Get('subscriber/task-list')
  @ApiResponse({
    status: 200,
    description: 'Task lists retrieved successfully.',
  })
  getAllTask() {
    return this.leaderBoardService.getTasksGroupedByLevel();
  }
}
