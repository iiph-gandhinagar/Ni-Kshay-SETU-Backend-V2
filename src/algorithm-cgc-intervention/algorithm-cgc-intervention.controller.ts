/**
 * Controller for managing CGC Intervention Algorithms.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * CGC Intervention Algorithms. It also includes endpoints for fetching master nodes,
 * dependent nodes, descendants, and executing scripts related to CGC Intervention Algorithms.
 *
 * ## Features:
 * - Create a new CGC Intervention Algorithm.
 * - Retrieve all CGC Intervention Algorithms with optional filters and pagination.
 * - Fetch master nodes and dependent nodes for subscribers.
 * - Fetch descendants and execute scripts for administrators.
 * - Retrieve, update, and delete a specific CGC Intervention Algorithm by ID.
 *
 * ## Guards and Permissions:
 * - AdminAuthGuard and PermissionsGuard are used to secure most endpoints.
 * - SubscriberAuthGuard is used for subscriber-specific endpoints.
 * - Permissions are enforced to ensure proper access control.
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
  Req,
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
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AlgorithmCgcInterventionService } from './algorithm-cgc-intervention.service';
import { CreateAlgorithmCgcInterventionDto } from './dto/create-algorithm-cgc-intervention.dto';
import { UpdateAlgorithmCgcInterventionDto } from './dto/update-algorithm-cgc-intervention.dto';

@ApiTags('algorithm-cgc-intervention')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-cgc-intervention')
export class AlgorithmCgcInterventionController {
  constructor(
    private readonly algorithmCgcInterventionService: AlgorithmCgcInterventionService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.create')
  @ApiOperation({ summary: 'Create a new CGC Intervention Algorithm' })
  @Post()
  create(
    @Body()
    createAlgorithmCgcInterventionDto: CreateAlgorithmCgcInterventionDto,
  ) {
    return this.algorithmCgcInterventionService.create(
      createAlgorithmCgcInterventionDto,
    );
  }

  @ApiOperation({ summary: 'Get All CGC Intervention Algorithm' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'nodeType', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.algorithmCgcInterventionService.findAll(paginationDto);
  }

  @Get('master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes (Subscriber)' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(@Req() req, @Headers('lang') lang: string) {
    const { _id } = req.user;
    return this.algorithmCgcInterventionService.getMasterNode(_id, lang);
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.index')
  MasterNode() {
    return this.algorithmCgcInterventionService.getMasterNodes();
  }

  @Get('dependent-nodes/:id')
  @ApiOperation({ summary: 'Get Dependent Nodes (Subscriber)' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getDependentNodes(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmCgcInterventionService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.index')
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmCgcInterventionService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get CGC Intervention Algorithm Data' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.script')
  @Get('script-cgc-intervention')
  scriptCgcInterventionAlgorithm() {
    return this.algorithmCgcInterventionService.scriptCgcInterventionAlgorithm();
  }

  @ApiOperation({ summary: 'Get CGC Intervention Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmCgcInterventionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update CGC Intervention Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAlgorithmCgcInterventionDto: UpdateAlgorithmCgcInterventionDto,
  ) {
    return this.algorithmCgcInterventionService.update(
      id,
      updateAlgorithmCgcInterventionDto,
    );
  }

  @ApiOperation({ summary: 'Delete CGC Intervention Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-cgc-intervention.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmCgcInterventionService.remove(id);
  }
}
