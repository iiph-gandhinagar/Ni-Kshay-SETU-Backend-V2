/**
 * Controller for managing TB-related operations.
 *
 * This controller provides endpoints for creating and managing TB patient forms,
 * sending and downloading prescriptions, and handling session-related operations.
 * It includes role-based access control using guards and permissions.
 *
 * Endpoints:
 * - Create a new patient form
 * - Store changes to manage TB details
 * - Send prescription details via WhatsApp
 * - Download prescription details as a PDF
 * - Email prescription details
 * - Retrieve all manage TB records with pagination and filtering
 * - Create a session for TB management
 *
 * Guards:
 * - `SubscriberAuthGuard`: Ensures the user is authenticated as a subscriber.
 * - `AdminAuthGuard`: Ensures the user is authenticated as an admin.
 * - `PermissionsGuard`: Ensures the user has the required permissions.
 *
 * Decorators:
 * - `@ApiTags`: Groups endpoints under the "manage-tb" tag in Swagger documentation.
 * - `@ApiBearerAuth`: Specifies the use of bearer token authentication.
 * - `@ApiOperation`: Provides a summary for each endpoint in Swagger documentation.
 * - `@ApiQuery`: Defines query parameters for filtering and pagination.
 * - `@Permissions`: Specifies the required permissions for certain endpoints.
 */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
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
import { Response } from 'express';
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { CreateManageTbDto } from './dto/create-manage-tb.dto';
import { SendPrescriptionOnPhone } from './dto/send-prescription-on-phone.dto';
import { StoreManageTbDto } from './dto/store-manage-tb.dto';
import { ManageTbService } from './manage-tb.service';

@ApiTags('manage-tb')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('manage-tb')
export class ManageTbController {
  constructor(private readonly manageTbService: ManageTbService) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Create a new Patient form' })
  @Post()
  create(@Body() createManageTbDto: CreateManageTbDto) {
    return this.manageTbService.create(createManageTbDto);
  }

  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.kbase.store')
  @ApiOperation({ summary: 'Store Manage Tb changes Details' })
  @Post('store-manage-tb')
  storeChangesOfManageTB(
    @Body() storeManageTb: StoreManageTbDto,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.manageTbService.storeChangesOfManageTB(storeManageTb, _id);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Send Prescription Details on WhatsApp' })
  @Post('send-prescription')
  sendPrescriptionOnWhatsApp(
    @Body() sendPrescriptionOnPhone: SendPrescriptionOnPhone,
    @Req() request,
  ) {
    const { _id } = request.user;
    return this.manageTbService.sendPrescriptionOnWhatsApp(
      sendPrescriptionOnPhone,
      _id,
    );
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Download Prescription Details' })
  @Post('download-prescription')
  async downloadPrescription(
    @Body() sendPrescriptionOnPhone: SendPrescriptionOnPhone,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.manageTbService.downloadPrescription(
      sendPrescriptionOnPhone,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="certificate.pdf"',
    );
    // Pipe the PDF stream to the response
    pdfBuffer.data.pipe(res);
  }

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Download Prescription Details' })
  @Post('email-prescription')
  async emailPrescription(
    @Body() sendPrescriptionOnPhone: SendPrescriptionOnPhone,
    @Req() request,
  ) {
    const { _id } = request.user;
    return await this.manageTbService.emailPrescription(
      sendPrescriptionOnPhone,
      _id,
    );
  }

  @ApiOperation({ summary: 'Get All Manage Tb' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.manage-tb.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.manageTbService.findAll(paginationDto);
  }

  @UseGuards(SubscriberAuthGuard)
  @Post('create-session')
  sessionApi() {
    return this.manageTbService.sessionApi();
  }
}
