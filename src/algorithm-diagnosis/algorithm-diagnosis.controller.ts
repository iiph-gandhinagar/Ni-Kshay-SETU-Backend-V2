/**
 * Controller responsible for managing Diagnosis Algorithms.
 * Provides endpoints for creating, retrieving, updating, and deleting diagnosis algorithms,
 * as well as managing related nodes and sending notifications.
 *
 * This controller is secured with guards and permissions to ensure that only authorized
 * users can access specific endpoints.
 *
 * Features:
 * - Create a new diagnosis algorithm.
 * - Send initial notifications for a diagnosis algorithm.
 * - Retrieve all diagnosis algorithms with optional pagination and filtering.
 * - Retrieve master nodes and dependent nodes for subscribers and admins.
 * - Execute scripts related to diagnosis algorithms.
 * - Retrieve, update, and delete diagnosis algorithms by ID.
 *
 * Guards:
 * - `AdminAuthGuard`: Ensures that only admin users can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures that only subscribers can access specific endpoints.
 * - `PermissionsGuard`: Validates user permissions for specific actions.
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
import { AlgorithmDiagnosisService } from './algorithm-diagnosis.service';
import { CreateAlgorithmDiagnosisDto } from './dto/create-algorithm-diagnosis.dto';
import { UpdateAlgorithmDiagnosisDto } from './dto/update-algorithm-diagnosis.dto';

@ApiTags('algorithm-diagnosis')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-diagnosis')
export class AlgorithmDiagnosisController {
  constructor(
    private readonly algorithmDiagnosisService: AlgorithmDiagnosisService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.create')
  @ApiOperation({ summary: 'Create a new Diagnosis Algorithm' })
  @Post()
  create(@Body() createAlgorithmDiagnosisDto: CreateAlgorithmDiagnosisDto) {
    return this.algorithmDiagnosisService.create(createAlgorithmDiagnosisDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.algorithmDiagnosisService.sendInitialInvitation(id, _id);
  }

  @ApiOperation({ summary: 'Get All Diagnosis Algorithm' })
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
  @Permissions('admin.algorithm-diagnosis.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.algorithmDiagnosisService.findAll(paginationDto);
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
    return this.algorithmDiagnosisService.getMasterNode(_id, lang);
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.index')
  MasterNode() {
    return this.algorithmDiagnosisService.getMasterNodes();
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
    return this.algorithmDiagnosisService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.index')
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmDiagnosisService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get Diagnosis Data' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.script')
  @Get('script-diagnosis')
  scriptDiagnosisAlgorithm() {
    return this.algorithmDiagnosisService.scriptDiagnosisAlgorithm();
  }

  @ApiOperation({ summary: 'Get Diagnosis Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmDiagnosisService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Diagnosis Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlgorithmDiagnosisDto: UpdateAlgorithmDiagnosisDto,
  ) {
    return this.algorithmDiagnosisService.update(
      id,
      updateAlgorithmDiagnosisDto,
    );
  }

  @ApiOperation({ summary: 'Delete Diagnosis Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-diagnosis.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmDiagnosisService.remove(id);
  }
}
