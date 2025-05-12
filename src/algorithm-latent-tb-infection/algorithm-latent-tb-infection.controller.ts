/**
 * Controller for managing operations related to the Latent TB Infection Algorithm.
 *
 * This controller provides endpoints for:
 * - Creating, updating, and deleting Latent TB Infection Algorithms.
 * - Fetching details of algorithms, master nodes, dependent nodes, and descendants.
 * - Sending notifications and executing scripts related to Latent TB Infection Algorithms.
 *
 * It uses various guards for authentication and authorization, including:
 * - `AdminAuthGuard` for admin-level access.
 * - `SubscriberAuthGuard` for subscriber-level access.
 * - `PermissionsGuard` for fine-grained permission control.
 *
 * The controller also integrates with Swagger for API documentation and uses a validation pipe
 * to ensure incoming requests are properly validated.
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
import { AlgorithmLatentTbInfectionService } from './algorithm-latent-tb-infection.service';
import { CreateAlgorithmLatentTbInfectionDto } from './dto/create-algorithm-latent-tb-infection.dto';
import { UpdateAlgorithmLatentTbInfectionDto } from './dto/update-algorithm-latent-tb-infection.dto';

@ApiTags('algorithm-latent-tb-infection')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('algorithm-latent-tb-infection')
export class AlgorithmLatentTbInfectionController {
  constructor(
    private readonly algorithmLatentTbInfectionService: AlgorithmLatentTbInfectionService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.create')
  @ApiOperation({ summary: 'Create a new Latent Tb Algorithm' })
  @Post()
  create(
    @Body()
    createAlgorithmLatentTbInfectionDto: CreateAlgorithmLatentTbInfectionDto,
  ) {
    return this.algorithmLatentTbInfectionService.create(
      createAlgorithmLatentTbInfectionDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.algorithmLatentTbInfectionService.sendInitialInvitation(
      id,
      _id,
    );
  }

  @ApiOperation({ summary: 'Get All Latent Tb Algorithm' })
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
  @Permissions('admin.latent-tb-infection.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.algorithmLatentTbInfectionService.findAll(paginationDto);
  }

  @Get('master-nodes')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Master Node Details (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getMasterNodes(@Req() req, @Headers('lang') lang: string) {
    const { _id } = req.user;
    return this.algorithmLatentTbInfectionService.getMasterNode(_id, lang);
  }

  @Get('display-master-nodes')
  @ApiOperation({ summary: 'Get All Master Nodes' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.master-nodes')
  MasterNode() {
    return this.algorithmLatentTbInfectionService.getMasterNodes();
  }

  @Get('dependent-nodes/:id')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Dependent nodes by id (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  getDependentNodes(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmLatentTbInfectionService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Descendants nodes Details' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.index')
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('descendants-nodes/:id')
  getAllDescendants(@Param('id') id: string, @Headers('lang') lang: string) {
    return this.algorithmLatentTbInfectionService.getChild(id, lang);
  }

  @ApiOperation({ summary: 'Script to get Latent Tb Algorithm Data' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.algorithm-differential-care.script')
  @Get('script-latent-tb')
  scriptLatentTbAlgorithm() {
    return this.algorithmLatentTbInfectionService.scriptLatentTbAlgorithm();
  }

  @ApiOperation({ summary: 'Get Latent Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.algorithmLatentTbInfectionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Latent Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAlgorithmLatentTbInfectionDto: UpdateAlgorithmLatentTbInfectionDto,
  ) {
    return this.algorithmLatentTbInfectionService.update(
      id,
      updateAlgorithmLatentTbInfectionDto,
    );
  }

  @ApiOperation({ summary: 'Delete Latent Tb Algorithm by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.latent-tb-infection.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.algorithmLatentTbInfectionService.remove(id);
  }
}
