/**
 * Controller for managing Algorithm Guidance on Adverse Drug Reaction (ADR).
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * guidance on ADR algorithms, as well as managing related nodes and sending notifications.
 *
 * Key functionalities include:
 * - Creating new guidance on ADR algorithms.
 * - Sending initial notifications for guidance.
 * - Retrieving all guidance on ADR algorithms with pagination and filtering options.
 * - Managing master and dependent nodes for guidance.
 * - Running scripts to fetch guidance data.
 * - Retrieving, updating, and deleting specific guidance on ADR algorithms by ID.
 *
 * Guards and permissions are applied to ensure secure access to the endpoints.
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
import { AlgorithmGuidanceOnAdverseDrugReactionService } from './algorithm-guidance-on-adverse-drug-reaction.service';
import { CreateAlgorithmGuidanceOnAdverseDrugReactionDto } from './dto/create-algorithm-guidance-on-adverse-drug-reaction.dto';
import { UpdateAlgorithmGuidanceOnAdverseDrugReactionDto } from './dto/update-algorithm-guidance-on-adverse-drug-reaction.dto';

@ApiTags('algorithm-guidance-on-adverse-drug-reaction')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-guidance-on-adverse-drug-reaction')
export class AlgorithmGuidanceOnAdverseDrugReactionController {
  constructor(
    private readonly algorithmGuidanceOnAdverseDrugReactionService: AlgorithmGuidanceOnAdverseDrugReactionService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.create')
  @ApiOperation({ summary: 'Create a new Guidance On ADR Algorithm' })
  @Post()
  create(
    @Body()
    createAlgorithmGuidanceOnAdverseDrugReactionDto: CreateAlgorithmGuidanceOnAdverseDrugReactionDto,
  ) {
    return this.algorithmGuidanceOnAdverseDrugReactionService.create(
      createAlgorithmGuidanceOnAdverseDrugReactionDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.algorithmGuidanceOnAdverseDrugReactionService.sendInitialInvitation(
      id,
      _id,
    );
  }

  @ApiOperation({ summary: 'Get All Guidance On ADR Algorithm' })
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
    return this.algorithmGuidanceOnAdverseDrugReactionService.findAll(
      paginationDto,
    );
  }

  @Get('master-nodes')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Master nodes Details (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(@Req() req, @Headers('lang') lang: string) {
    const { _id } = req.user;
    return this.algorithmGuidanceOnAdverseDrugReactionService.getMasterNode(
      _id,
      lang,
    );
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.master-nodes')
  MasterNode() {
    return this.algorithmGuidanceOnAdverseDrugReactionService.getMasterNodes();
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
    return this.algorithmGuidanceOnAdverseDrugReactionService.getChild(
      id,
      lang,
    );
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.index')
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmGuidanceOnAdverseDrugReactionService.getChild(
      id,
      lang,
    );
  }

  @ApiOperation({ summary: 'Script to get Guidance On ADR Data' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.script')
  @Get('script-guidance-on-adr')
  scriptGuidanceOnADRAlgorithm() {
    return this.algorithmGuidanceOnAdverseDrugReactionService.scriptGuidanceOnADRAlgorithm();
  }

  @ApiOperation({ summary: 'Get Guidance On ADR Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmGuidanceOnAdverseDrugReactionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Guidance On ADR Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAlgorithmGuidanceOnAdverseDrugReactionDto: UpdateAlgorithmGuidanceOnAdverseDrugReactionDto,
  ) {
    return this.algorithmGuidanceOnAdverseDrugReactionService.update(
      id,
      updateAlgorithmGuidanceOnAdverseDrugReactionDto,
    );
  }

  @ApiOperation({ summary: 'Delete Guidance On ADR Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.guidance-on-adverse-drug-reaction.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmGuidanceOnAdverseDrugReactionService.remove(id);
  }
}
