/**
 * Controller for managing institutes and their related operations.
 *
 * This controller provides endpoints for creating, updating, deleting, and retrieving institutes,
 * as well as managing members and transferring ownership. It includes role-based access control
 * using guards and permissions to ensure secure access to the endpoints.
 *
 * Features:
 * - Create a new institute with a manager.
 * - Add or delete members of an institute.
 * - Transfer ownership of an institute.
 * - Retrieve a list of institutes with pagination and filtering options.
 * - Retrieve a list of members for a specific institute.
 * - Retrieve, update, or delete a specific institute by ID.
 *
 * Decorators:
 * - `@ApiTags('institute')`: Groups the endpoints under the "institute" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AdminAuthGuard, PermissionsGuard)`: Applies guards for authentication and permission checks.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Enables validation and transformation of request data.
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
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { TransferManagerDto } from './dto/transfer-manager.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InstituteService } from './institute.service';

@ApiTags('institute')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('institute')
export class InstituteController {
  constructor(private readonly instituteService: InstituteService) {}

  @ApiOperation({ summary: 'Create a new Institute with manager' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.create')
  @Post()
  create(@Body() createInstituteDto: CreateInstituteDto, @Req() request) {
    const { _id, role } = request.user;
    return this.instituteService.create(createInstituteDto, _id, role);
  }

  @ApiOperation({ summary: 'Add Member' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.add_member')
  @Post('add-member')
  addMember(@Body() addMemberDto: AddMemberDto) {
    return this.instituteService.addMember(addMemberDto);
  }

  @ApiOperation({ summary: 'Delete Member' })
  @Post('delete-member')
  deleteMember(@Body() deleteMemberDto: DeleteMemberDto) {
    return this.instituteService.deleteMember(deleteMemberDto);
  }

  @ApiOperation({ summary: 'transfer OwnerShip' })
  @Post('transfer-ownership')
  transferManager(
    @Req() request,
    @Body() transferManagerDto: TransferManagerDto,
  ) {
    const { _id } = request.user;
    return this.instituteService.transferManager(_id, transferManagerDto);
  }

  @ApiOperation({ summary: 'Get All Institute' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'subscriber', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'institute', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    return this.instituteService.findAll(paginationDto, request.user);
  }

  @ApiOperation({ summary: 'Get Institute Member List' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.member_list')
  @Get('institute-member-list/:instituteId')
  getMembersOfInstitute(@Param('instituteId') instituteId: string) {
    return this.instituteService.getMembersOfInstitute(instituteId);
  }

  @ApiOperation({ summary: 'Get Institute by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instituteService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Institute by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    return this.instituteService.update(id, updateInstituteDto);
  }

  @ApiOperation({ summary: 'Delete Institute by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.institute.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instituteService.remove(id);
  }
}
