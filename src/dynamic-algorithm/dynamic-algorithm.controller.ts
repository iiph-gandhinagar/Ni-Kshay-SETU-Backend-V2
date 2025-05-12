/**
 * Controller for managing Dynamic Algorithms.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * dynamic algorithms, as well as additional operations such as fetching master nodes,
 * dependent nodes, and executing scripts for diagnosis data.
 *
 * Features:
 * - Admin and Subscriber authentication guards for access control.
 * - Pagination and filtering support for retrieving dynamic algorithms.
 * - Language-specific responses for certain endpoints.
 * - Integration with NestJS validation and Swagger documentation.
 *
 * Endpoints:
 * - Create a new dynamic algorithm.
 * - Retrieve all dynamic algorithms with optional filters and pagination.
 * - Retrieve master nodes and dependent nodes for a specific algorithm.
 * - Execute a script to fetch diagnosis data.
 * - Retrieve, update, or delete a specific dynamic algorithm by ID.
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { CreateDynamicAlgorithmDto } from './dto/create-dynamic-algorithm.dto';
import { UpdateDynamicAlgorithmDto } from './dto/update-dynamic-algorithm.dto';
import { DynamicAlgorithmService } from './dynamic-algorithm.service';

@ApiTags('dynamic-algorithm')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('dynamic-algorithm')
export class DynamicAlgorithmController {
  constructor(
    private readonly dynamicAlgorithmService: DynamicAlgorithmService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Dynamic Algorithm' })
  @Post()
  create(@Body() createDynamicAlgorithmDto: CreateDynamicAlgorithmDto) {
    return this.dynamicAlgorithmService.create(createDynamicAlgorithmDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Dynamic Algorithm' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'nodeType', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.dynamicAlgorithmService.findAll(paginationDto);
  }

  @Get('master-nodes/:algoId')
  @ApiOperation({ summary: 'Get All Master Nodes (Subscriber)' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(
    @Req() req,
    @Headers('lang') lang: string,
    @Param('algoId') algoId: string,
  ) {
    const { _id } = req.user;
    return this.dynamicAlgorithmService.getMasterNode(_id, lang, algoId);
  }

  @Get('display-master-nodes/:algoId')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  MasterNode(@Param('algoId') algoId: string) {
    return this.dynamicAlgorithmService.getMasterNodes(algoId);
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
    return this.dynamicAlgorithmService.getChild(id, lang);
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
    return this.dynamicAlgorithmService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get Diagnosis Data' })
  @UseGuards(AdminAuthGuard)
  @Get('script-diagnosis')
  scriptDiagnosisAlgorithm() {
    return this.dynamicAlgorithmService.scriptDiagnosisAlgorithm();
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Dynamic Algorithm by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dynamicAlgorithmService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Dynamic Algorithm by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDynamicAlgorithmDto: UpdateDynamicAlgorithmDto,
  ) {
    return this.dynamicAlgorithmService.update(id, updateDynamicAlgorithmDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Dynamic Algorithm by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dynamicAlgorithmService.remove(id);
  }
}
