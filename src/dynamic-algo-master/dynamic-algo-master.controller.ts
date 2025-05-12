/**
 * Controller for managing Dynamic Algorithm Master entities.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting Dynamic Algorithm Master records. It also includes a
 * subscriber-specific endpoint for fetching master nodes.
 *
 * ## Guards:
 * - AdminAuthGuard: Protects admin-specific endpoints.
 * - SubscriberAuthGuard: Protects subscriber-specific endpoints.
 *
 * ## Decorators:
 * - `@ApiTags`: Categorizes the controller under "dynamic-algo-master" in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that endpoints require an access token for authentication.
 * - `@UsePipes`: Applies validation and transformation to incoming requests.
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
import { CreateDynamicAlgoMasterDto } from './dto/create-dynamic-algo-master.dto';
import { UpdateDynamicAlgoMasterDto } from './dto/update-dynamic-algo-master.dto';
import { DynamicAlgoMasterService } from './dynamic-algo-master.service';

@ApiTags('dynamic-algo-master')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('dynamic-algo-master')
export class DynamicAlgoMasterController {
  constructor(
    private readonly dynamicAlgoMasterService: DynamicAlgoMasterService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Dynamic Algo Master ' })
  @Post()
  create(@Body() createDynamicAlgoMasterDto: CreateDynamicAlgoMasterDto) {
    return this.dynamicAlgoMasterService.create(createDynamicAlgoMasterDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Dynamic Algo Master ' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.dynamicAlgoMasterService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Dynamic Algo Master ( subscriber)' })
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('get-master-nodes')
  dynamicParent(@Headers('lang') lang: string) {
    return this.dynamicAlgoMasterService.dynamicParent(lang);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Dynamic Algo Master by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dynamicAlgoMasterService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Algo Master by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDynamicAlgoMasterDto: UpdateDynamicAlgoMasterDto,
  ) {
    return this.dynamicAlgoMasterService.update(id, updateDynamicAlgoMasterDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Algo Master by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dynamicAlgoMasterService.remove(id);
  }
}
