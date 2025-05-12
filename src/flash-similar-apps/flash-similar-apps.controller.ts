/**
 * Controller for managing Flash Similar Apps.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting Flash Similar Apps. It also includes functionality for
 * paginated retrieval and filtering of similar apps.
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
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { CreateFlashSimilarAppDto } from './dto/create-flash-similar-app.dto';
import { UpdateFlashSimilarAppDto } from './dto/update-flash-similar-app.dto';
import { FlashSimilarAppsService } from './flash-similar-apps.service';

@ApiTags('flash-similar-apps')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('flash-similar-apps')
export class FlashSimilarAppsController {
  constructor(
    private readonly flashSimilarAppsService: FlashSimilarAppsService,
  ) {}

  @ApiOperation({ summary: 'Create a new Flash Similar Apps Details' })
  @Post()
  create(@Body() createFlashSimilarAppDto: CreateFlashSimilarAppDto) {
    return this.flashSimilarAppsService.create(createFlashSimilarAppDto);
  }

  @ApiOperation({ summary: 'Get All Active Similar Apps' })
  @Get('get-all-similar-apps')
  findAllSimilarApps() {
    return this.flashSimilarAppsService.findActiveSimilarApps();
  }

  @ApiOperation({ summary: 'Get All Flash Similar Apps' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'subTitle', required: false })
  @ApiQuery({ name: 'href', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.flashSimilarAppsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Flash Similar Apps by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashSimilarAppsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Flash Similar Apps by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFlashSimilarAppDto: UpdateFlashSimilarAppDto,
  ) {
    return this.flashSimilarAppsService.update(id, updateFlashSimilarAppDto);
  }

  @ApiOperation({ summary: 'Delete Flash Similar Apps by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashSimilarAppsService.remove(id);
  }
}
