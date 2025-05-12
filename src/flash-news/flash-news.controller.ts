/**
 * Controller responsible for managing Flash News operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting flash news, as well as scraping data from a website.
 * It uses NestJS decorators for routing, validation, and authentication.
 *
 * Features:
 * - Create a new flash news entry.
 * - Retrieve all flash news with optional pagination and filtering.
 * - Scrape data from a website.
 * - Retrieve a specific flash news entry by ID.
 * - Update a flash news entry by ID.
 * - Delete a flash news entry by ID.
 *
 * Decorators:
 * - `@ApiTags('flash-news')`: Groups the endpoints under the "flash-news" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that the endpoints require a bearer token for authentication.
 * - `@UseGuards(AuthGuard)`: Protects the endpoints with an authentication guard.
 * - `@UsePipes(new ValidationPipe({ transform: true }))`: Enables validation and transformation of request data.
 *
 * Dependencies:
 * - `FlashNewsService`: Service layer for handling business logic related to flash news.
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
import { AuthGuard } from 'src/jwt/jwt-auth.guard';
import { CreateFlashNewDto } from './dto/create-flash-new.dto';
import { UpdateFlashNewDto } from './dto/update-flash-new.dto';
import { FlashNewsService } from './flash-news.service';

@ApiTags('flash-news')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('flash-news')
export class FlashNewsController {
  constructor(private readonly flashNewsService: FlashNewsService) {}

  @ApiOperation({ summary: 'Create a new Flash News' })
  @Post()
  create(@Body() createFlashNewDto: CreateFlashNewDto) {
    return this.flashNewsService.create(createFlashNewDto);
  }

  @ApiOperation({ summary: 'Get All Flash News' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'href', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.flashNewsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Scrape Website date' })
  @Get('scrape')
  scrapeWebsite() {
    console.log('inside scrape controller--->');
    return this.flashNewsService.scrapeData();
  }

  @ApiOperation({ summary: 'Get Flash News by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashNewsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Flash News by id' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFlashNewDto: UpdateFlashNewDto,
  ) {
    return this.flashNewsService.update(id, updateFlashNewDto);
  }

  @ApiOperation({ summary: 'Delete Flash News by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashNewsService.remove(id);
  }
}
