/**
 * Controller responsible for handling operations related to Treatment Algorithms.
 * This includes creating, retrieving, updating, deleting, and managing nodes
 * and scripts associated with Treatment Algorithms.
 *
 * ## Features:
 * - Create new Treatment Algorithms.
 * - Retrieve all or specific Treatment Algorithms with pagination and filtering.
 * - Manage master and dependent nodes for subscribers and admins.
 * - Execute scripts for treatment data and translations.
 * - Update and delete Treatment Algorithms by ID.
 *
 * ## Guards:
 * - Uses `AdminAuthGuard` and `PermissionsGuard` for admin-specific operations.
 * - Uses `SubscriberAuthGuard` for subscriber-specific operations.
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
import { AlgorithmTreatmentService } from './algorithm-treatment.service';
import { CreateAlgorithmTreatmentDto } from './dto/create-algorithm-treatment.dto';
import { UpdateAlgorithmTreatmentDto } from './dto/update-algorithm-treatment.dto';

@ApiTags('algorithm-treatment')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-treatment')
export class AlgorithmTreatmentController {
  constructor(
    private readonly algorithmTreatmentService: AlgorithmTreatmentService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.create')
  @ApiOperation({ summary: 'Create a new Treatment Algorithm' })
  @Post()
  create(@Body() createAlgorithmTreatmentDto: CreateAlgorithmTreatmentDto) {
    return this.algorithmTreatmentService.create(createAlgorithmTreatmentDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.algorithmTreatmentService.sendInitialInvitation(id, _id);
  }

  @ApiOperation({ summary: 'Get All Treatment Algorithm' })
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
  @Permissions('admin.treatment-algorithm.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.algorithmTreatmentService.findAll(paginationDto);
  }

  @Get('master-nodes')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Master Nodes Details (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(@Req() req, @Headers('lang') lang: string) {
    const { _id } = req.user;
    return this.algorithmTreatmentService.getMasterNode(_id, lang);
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.master-nodes')
  MasterNode() {
    return this.algorithmTreatmentService.getMasterNodes();
  }

  @Get('dependent-nodes/:id')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Dependent node from id (subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getDependentNodes(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmTreatmentService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.index')
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmTreatmentService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get Treatment Data' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.delete')
  @Get('script-treatment')
  scriptTreatmentAlgorithm() {
    return this.algorithmTreatmentService.scriptTreatmentAlgorithm();
  }

  @ApiOperation({ summary: 'translate script' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.delete')
  @Get('script-translate')
  scriptTranslate() {
    return this.algorithmTreatmentService.translateScript();
  }

  @ApiOperation({ summary: 'Get Treatment Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmTreatmentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Treatment Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlgorithmTreatmentDto: UpdateAlgorithmTreatmentDto,
  ) {
    return this.algorithmTreatmentService.update(
      id,
      updateAlgorithmTreatmentDto,
    );
  }

  @ApiOperation({ summary: 'Delete Treatment Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.treatment-algorithm.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmTreatmentService.remove(id);
  }
}
