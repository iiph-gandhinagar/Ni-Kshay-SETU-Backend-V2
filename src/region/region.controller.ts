/**
 * @module RegionController
 * @description
 * This controller handles all region-related operations, including fetching countries, states, districts, blocks, cadres, health facilities,
 * and other related data. It also provides endpoints for administrative and subscriber-specific functionalities.
 *
 * @class RegionController
 * @constructor
 * @param {RegionService} regionService - The service responsible for handling region-related business logic.
 *
 * @decorator `@ApiTags('master-api')` - Groups the controller's endpoints under the 'master-api' tag in Swagger documentation.
 * @decorator `@Controller('region')` - Defines the base route for all endpoints in this controller as `/region`.
 */
// src/region/region.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
  Req,
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
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { RegionService } from './region.service';

@ApiTags('master-api')
@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('country')
  async getAllCountries() {
    return this.regionService.getAllCountries();
  }

  @Get('admin-state')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  async getAllAdminState(@Req() request) {
    const { _id } = request.user;
    return this.regionService.getAllAdminState(_id);
  }

  @Get('admin-district')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  async getAllAdminDistrict(@Req() request) {
    const { _id } = request.user;
    return this.regionService.getAllAdminDistrict(_id);
  }

  @Get('states')
  async getAllStates() {
    return this.regionService.getAllStates();
  }

  @Get('districts')
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'allState', required: false, type: Boolean })
  async getAllDistricts(@Query() paginationDto: PaginationDto) {
    return this.regionService.getAllDistricts(paginationDto);
  }

  @Get('blocks')
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'allDistrict', required: false, type: Boolean })
  async getAllBlocks(@Query() paginationDto: PaginationDto) {
    return this.regionService.getAllBlocks(paginationDto);
  }

  @Get('cadres')
  @ApiQuery({ name: 'cadreTypes', required: false, type: [String] })
  async getAllCadres(@Query() paginationDto: PaginationDto) {
    return this.regionService.getAllCadres(paginationDto);
  }

  @Get('get-all-cadres')
  async getAllCadreList() {
    return this.regionService.getAllCadreList();
  }

  @Get('cadre-types')
  async getAllCadreTypes() {
    return this.regionService.getAllCadreTypes();
  }

  @Get('health-facilities')
  @ApiQuery({ name: 'blockId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'allBlock', required: false, type: Boolean })
  async getAllHealthFacilities(@Query() paginationDto: PaginationDto) {
    return this.regionService.getAllHealthFacilities(paginationDto);
  }

  @Get('referral-health-facility')
  @ApiQuery({ name: 'stateId', required: false, type: String })
  @ApiQuery({ name: 'districtId', required: false, type: String })
  @ApiQuery({ name: 'blockId', required: false, type: String })
  @ApiQuery({ name: 'healthFacilityCode', required: false, type: String })
  @ApiQuery({ name: 'healthFacility', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async filterHealthFacilities(@Query() query: any) {
    return await this.regionService.referralHealthFacilities(query);
  }

  @Get('home-page')
  @ApiBearerAuth('access-token')
  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Home Page activities list' })
  async homePage(@Req() request) {
    const { _id } = request.user;
    return await this.regionService.homePage(_id);
  }

  @Get('get-redirect-node/:type')
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get Redirect Node Details' })
  @UseGuards(AdminAuthGuard)
  async getMasterNodes(@Param('type') type: string) {
    return await this.regionService.getMasterNodes(type);
  }

  @Get('get-master-drop-down')
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get master Drop Down Details' })
  @UseGuards(AdminAuthGuard)
  async masterDropDown(@Req() request) {
    const { _id } = request.user;
    return await this.regionService.masterDropDown(_id);
  }

  @Get('get-default-cadre-option')
  @ApiOperation({ summary: 'Get Default Cadre Options Details' })
  async getDefaultCadreOption() {
    return await this.regionService.defaultOptionSelection();
  }
}
