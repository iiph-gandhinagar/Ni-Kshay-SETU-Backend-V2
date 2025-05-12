/**
 * Controller responsible for handling operations related to blocks.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting blocks. It also supports pagination, filtering, and sorting
 * for retrieving a list of blocks.
 *
 * ## Guards:
 * - `AdminAuthGuard`: Ensures that only authenticated admin users can access these endpoints.
 * - `PermissionsGuard`: Ensures that users have the necessary permissions to perform specific actions.
 *
 * ## Permissions:
 * - `admin.block.create`: Required to create a new block.
 * - `admin.block.index`: Required to retrieve blocks or a specific block.
 * - `admin.block.edit`: Required to update a block.
 * - `admin.block.delete`: Required to delete a block.
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
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@ApiTags('block')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('block')
@UseGuards(PermissionsGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @ApiOperation({ summary: 'Create a new block' })
  @Permissions('admin.block.create')
  @Post()
  create(@Body() createBlockDto: CreateBlockDto) {
    return this.blockService.create(createBlockDto);
  }

  @ApiOperation({ summary: 'Get All block' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'stateCountry', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Permissions('admin.block.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.blockService.findAll(paginationDto, _id);
  }

  @ApiOperation({ summary: 'Get block by id' })
  @Permissions('admin.block.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @ApiOperation({ summary: 'Update block by id' })
  @Permissions('admin.block.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockDto: UpdateBlockDto) {
    return this.blockService.update(id, updateBlockDto);
  }

  @ApiOperation({ summary: 'Delete block by id' })
  @Permissions('admin.block.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockService.remove(id);
  }
}
