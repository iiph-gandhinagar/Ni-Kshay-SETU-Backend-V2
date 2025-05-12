/**
 * Controller responsible for managing survey-related operations.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting surveys, as well as sending notifications and fetching
 * survey details. It includes role-based access control using guards
 * and permissions to ensure secure access to the endpoints.
 
 * Guards:
 * - `AdminAuthGuard`: Ensures only admin users can access certain endpoints.
 * - `SubscriberAuthGuard`: Ensures only subscribers can access specific endpoints.
 * - `PermissionsGuard`: Enforces fine-grained permission checks for each operation.
 *
 * Decorators:
 * - `@ApiTags`: Groups endpoints under the "survey-master" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Indicates that endpoints require an access token for authentication.
 * - `@UsePipes`: Applies validation and transformation to incoming requests.
 * - `@Permissions`: Specifies the required permissions for accessing an endpoint.
 *
 * Dependencies:
 * - `SurveyMasterService`: Handles the business logic for survey operations.
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateSurveyMasterDto } from './dto/create-survey-master.dto';
import { UpdateSurveyMasterDto } from './dto/update-survey-master.dto';
import { SurveyMasterService } from './survey-master.service';

@ApiTags('survey-master')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('survey-master')
export class SurveyMasterController {
  constructor(private readonly surveyMasterService: SurveyMasterService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new Survey' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.create')
  @Post()
  create(@Body() createSurveyMasterDto: CreateSurveyMasterDto) {
    return this.surveyMasterService.create(createSurveyMasterDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Send Notification' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.create')
  @Post('send-initial-notification/:id')
  sendInitialInvitation(@Param('id') id: string, @Req() request) {
    const { _id } = request.user;
    return this.surveyMasterService.sendInitialInvitation(id, _id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Survey' })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.surveyMasterService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Get Active Survey Details' })
  @Get('get-survey-details')
  getSurvey(@Req() request) {
    const { _id } = request.user;
    return this.surveyMasterService.getSurvey(_id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get All Survey List' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.index')
  @Get('get-all-survey-list')
  findAllSurvey() {
    return this.surveyMasterService.findAllSurvey();
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get Survey by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyMasterService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update Survey by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSurveyMasterDto: UpdateSurveyMasterDto,
  ) {
    return this.surveyMasterService.update(id, updateSurveyMasterDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete Survey by id' })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.survey-master.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveyMasterService.remove(id);
  }
}
