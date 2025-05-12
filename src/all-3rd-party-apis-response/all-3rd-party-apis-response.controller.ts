/**
 * Controller for managing responses from all third-party APIs.
 *
 * This controller provides endpoints to create, retrieve, update, and delete
 * responses from third-party APIs. It is secured with an admin authentication
 * guard and uses validation pipes to ensure data integrity.
 *
 * @module All3rdPartyApisResponseController
 * @class
 * @description Handles CRUD operations for third-party API responses.
 *
 * @decorator `@Controller('all-3rd-party-apis-response')` - Defines the route prefix for this controller.
 * @decorator `@ApiTags('all-3rd-party-apis-response')` - Tags the controller for API documentation.
 * @decorator `@ApiBearerAuth('access-token')` - Requires a bearer token for authentication.
 * @decorator `@UseGuards(AdminAuthGuard)` - Protects routes with admin authentication.
 * @decorator `@UsePipes(new ValidationPipe({ transform: true }))` - Applies validation and transformation to incoming requests.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { All3rdPartyApisResponseService } from './all-3rd-party-apis-response.service';
import { CreateAll3rdPartyApisResponseDto } from './dto/create-all-3rd-party-apis-response.dto';
import { UpdateAll3rdPartyApisResponseDto } from './dto/update-all-3rd-party-apis-response.dto';

@Controller('all-3rd-party-apis-response')
@ApiTags('all-3rd-party-apis-response')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class All3rdPartyApisResponseController {
  constructor(
    private readonly all3rdPartyApisResponseService: All3rdPartyApisResponseService,
  ) {}

  @Post()
  create(
    @Body() createAll3rdPartyApisResponseDto: CreateAll3rdPartyApisResponseDto,
  ) {
    return this.all3rdPartyApisResponseService.create(
      createAll3rdPartyApisResponseDto,
    );
  }

  @Get()
  findAll() {
    return this.all3rdPartyApisResponseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.all3rdPartyApisResponseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAll3rdPartyApisResponseDto: UpdateAll3rdPartyApisResponseDto,
  ) {
    return this.all3rdPartyApisResponseService.update(
      +id,
      updateAll3rdPartyApisResponseDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.all3rdPartyApisResponseService.remove(+id);
  }
}
