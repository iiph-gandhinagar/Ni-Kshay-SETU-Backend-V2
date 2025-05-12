/**
 * Controller for managing Resource Materials.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting
 * resource materials, as well as additional operations such as sending notifications,
 * fetching hierarchical data, and executing scripts related to resource materials.
 *
 * ## Guards and Permissions:
 * - Admin and Subscriber guards are used to restrict access to certain endpoints.
 * - Permissions are enforced to ensure only authorized users can perform specific actions.

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
import { CreateResourceMaterialDto } from './dto/create-resource-material.dto';
import { UpdateResourceMaterialDto } from './dto/update-resource-material.dto';
import { ResourceMaterialService } from './resource-material.service';

@ApiTags('resource-material')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('resource-material')
export class ResourceMaterialController {
  constructor(
    private readonly resourceMaterialService: ResourceMaterialService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Resource Material' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-material.create')
  @Post()
  create(
    @Body() createResourceMaterialDto: CreateResourceMaterialDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.resourceMaterialService.create(createResourceMaterialDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-materials.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.resourceMaterialService.sendInitialInvitation(id, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All resource Material' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-material.index')
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'parentId', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'cadreId', required: false, type: [String] })
  @ApiQuery({ name: 'typeOfMaterials', required: false })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request) {
    const { _id } = request.user;
    return this.resourceMaterialService.findAll(paginationDto, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Script for fetching resource materials data' })
  @Get('script-resource-materials')
  scriptOfResourceMaterial(@Req() request) {
    const { _id } = request.user;
    return this.resourceMaterialService.scriptForResourceMaterial(_id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Script for fetching resource materials media' })
  @Get('script-resource-media')
  scriptOfResourceMedia() {
    return this.resourceMaterialService.scriptForMaterial();
  }

  @ApiOperation({ summary: 'Root Nodes' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('root-nodes')
  rootFolders(@Headers('lang') lang: string) {
    return this.resourceMaterialService.rootFolders(lang);
  }

  @ApiOperation({ summary: 'Get Child Nodes (Subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @ApiQuery({ name: 'filter', required: false })
  @UseGuards(SubscriberAuthGuard)
  @Get('get-folder-by-parentId/:parentId')
  getAllMaterials(
    @Req() request,
    @Param('parentId') parentId: string,
    @Headers('lang') lang: string,
    @Query() filter: string,
  ) {
    const { _id } = request.user;
    return this.resourceMaterialService.getAllMaterials(
      lang,
      _id,
      filter,
      parentId,
    );
  }

  @ApiOperation({ summary: 'Get Child Nodes' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @ApiQuery({ name: 'filter', required: false })
  @UseGuards(AdminAuthGuard)
  @Get('get-material-by-parentId/:parentId')
  getAllMaterial(
    @Param('parentId') parentId: string,
    @Headers('lang') lang: string,
    @Query() filter: string,
  ) {
    return this.resourceMaterialService.getAllMaterial(lang, filter, parentId);
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
    return this.resourceMaterialService.getAllDescendants(id, lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Resource Material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-material.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceMaterialService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Resource Material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-material.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourceMaterialDto: UpdateResourceMaterialDto,
  ) {
    return this.resourceMaterialService.update(id, updateResourceMaterialDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Resource Material by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.resource-material.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceMaterialService.remove(id);
  }
}
