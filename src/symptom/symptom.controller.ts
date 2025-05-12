/**
 * Controller responsible for managing symptoms in the application.
 *
 * This controller provides endpoints for creating, retrieving, updating,
 * and deleting symptoms. It also includes functionality for sending test
 * emails and supports both paginated and non-paginated retrieval of symptoms.
 *
 * Key Features:
 * - Create a new symptom with validation and permission checks.
 * - Retrieve all symptoms with optional pagination and filtering.
 * - Retrieve a specific symptom by its ID.
 * - Update or delete a symptom by its ID.
 * - Send test emails for verification purposes.
 *
 * Guards and Permissions:
 * - AdminAuthGuard and PermissionsGuard are used to secure endpoints.
 * - Permissions are defined for each operation to ensure proper access control.

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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { EmailService } from '../common/mail/email.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SymptomService } from './symptom.service';

@ApiTags('symptom')
@ApiBearerAuth('access-token')
@Controller('symptom')
@UsePipes(new ValidationPipe({ transform: true }))
export class SymptomController {
  constructor(
    private readonly symptomService: SymptomService,
    private readonly emailService: EmailService,
  ) {}

  @ApiOperation({ summary: 'Create a new Symptom' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.symptom.create')
  @Post()
  create(@Body() createSymptomDto: CreateSymptomDto) {
    return this.symptomService.create(createSymptomDto);
  }

  @ApiOperation({ summary: 'Get All Symptoms without Pagination' })
  @UseGuards(SubscriberAuthGuard)
  @ApiHeader({
    name: 'lang',
    description: 'The default language of the response',
    required: false, // Set to true if the header is required
    schema: { type: 'string' }, // Define the type of the header
  })
  @Get('master-symptom')
  findAllSymptoms(@Headers('lang') lang: string) {
    return this.symptomService.findSymptoms(lang);
  }

  @ApiOperation({ summary: 'Get All Symptoms' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.symptom.index')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'symptomTitle', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.symptomService.findAll(paginationDto);
  }

  @Get('send')
  async sendEmail(): Promise<string> {
    try {
      await this.emailService.sendMail(
        'amishat@digiflux.io',
        'Test Email',
        'This is a test email.',
      );
      return 'Email sent successfully';
    } catch (error) {
      return `Failed to send email: ${error.message}`;
    }
  }

  @ApiOperation({ summary: 'Get Symptoms by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.symptom.show')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.symptomService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Symptoms by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.symptom.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSymptomDto: UpdateSymptomDto) {
    return this.symptomService.update(id, updateSymptomDto);
  }

  @ApiOperation({ summary: 'Delete Symptoms by id' })
  @UseGuards(AdminAuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.symptom.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.symptomService.remove(id);
  }
}
