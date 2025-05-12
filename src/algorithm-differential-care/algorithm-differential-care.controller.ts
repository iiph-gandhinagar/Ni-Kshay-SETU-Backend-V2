/**
 * Controller for managing Differential TB Algorithm operations.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * Differential TB Algorithm records. It also includes endpoints for sending notifications,
 * retrieving master and dependent nodes, and executing scripts related to the algorithm.
 *
 * ## Endpoints:
 * - **Create Differential TB Algorithm**: Allows administrators to create a new algorithm.
 * - **Send Notification**: Sends an initial notification for a specific algorithm.
 * - **Retrieve All Algorithms**: Fetches a paginated list of all Differential TB Algorithms.
 * - **Retrieve Master Nodes**: Provides details of master nodes for subscribers.
 * - **Retrieve Dependent Nodes**: Fetches descendant nodes for a given master node.
 * - **Retrieve All Descendants**: Fetches all descendant nodes for a given master node.
 * - **Execute Script**: Runs a script to retrieve Latent TB Algorithm data.
 * - **Retrieve Algorithm by ID**: Fetches details of a specific algorithm by its ID.
 * - **Update Algorithm by ID**: Updates an existing algorithm by its ID.
 * - **Delete Algorithm by ID**: Deletes an algorithm by its ID.
 *
 * ## Guards and Permissions:
 * - Most endpoints are protected by `AdminAuthGuard` or `SubscriberAuthGuard`.
 * - Specific permissions are required for certain operations, enforced by `PermissionsGuard`.
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
import { AlgorithmDifferentialCareService } from './algorithm-differential-care.service';
import { CreateAlgorithmDifferentialCareDto } from './dto/create-algorithm-differential-care.dto';
import { UpdateAlgorithmDifferentialCareDto } from './dto/update-algorithm-differential-care.dto';

@ApiTags('algorithm-differential-care')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-differential-care')
export class AlgorithmDifferentialCareController {
  constructor(
    private readonly algorithmDifferentialCareService: AlgorithmDifferentialCareService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-differential-care.create')
  @ApiOperation({ summary: 'Create a new Differential Tb Algorithm' })
  @Post()
  create(
    @Body()
    createAlgorithmDifferentialCareDto: CreateAlgorithmDifferentialCareDto,
  ) {
    return this.algorithmDifferentialCareService.create(
      createAlgorithmDifferentialCareDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-differential-care.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.algorithmDifferentialCareService.sendInitialInvitation(id, _id);
  }

  @ApiOperation({ summary: 'Get All Differential Tb Algorithm' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'nodeType', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.algorithmDifferentialCareService.findAll(paginationDto);
  }

  @Get('master-nodes')
  @ApiOperation({ summary: 'Master nodes Details (Subscriber)' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(@Req() req, @Headers('lang') lang: string) {
    const { _id } = req.user;
    return this.algorithmDifferentialCareService.getMasterNode(_id, lang);
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  MasterNode() {
    return this.algorithmDifferentialCareService.getMasterNodes();
  }

  @Get('dependent-nodes/:id')
  @ApiOperation({ summary: 'Descendants nodes Details (Subscriber)' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getDependentNodes(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmDifferentialCareService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmDifferentialCareService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get Latent Tb Algorithm Data' })
  @UseGuards(AdminAuthGuard)
  @Get('script-differential-care')
  scriptDifferentialCareAlgorithm() {
    return this.algorithmDifferentialCareService.scriptDifferentialCareAlgorithm();
  }

  @ApiOperation({ summary: 'Get Differential Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmDifferentialCareService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Differential Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAlgorithmDifferentialCareDto: UpdateAlgorithmDifferentialCareDto,
  ) {
    return this.algorithmDifferentialCareService.update(
      id,
      updateAlgorithmDifferentialCareDto,
    );
  }

  @ApiOperation({ summary: 'Delete Differential Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmDifferentialCareService.remove(id);
  }
}
