/**
 * Controller responsible for handling Screening Tool operations.
 *
 * This controller provides endpoints for creating a new screening tool
 * and executing various migration scripts. It uses guards to restrict
 * access to certain endpoints based on user roles (Subscriber or Admin).
 *
 * - `@ApiTags('screening')`: Groups the endpoints under the "screening" tag in Swagger documentation.
 * - `@ApiBearerAuth('access-token')`: Indicates that endpoints require a bearer token for authentication.
 * - `@UsePipes(ValidationPipe)`: Applies validation and transformation to incoming requests.
 */
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { ScreeningService } from './screening.service';

@ApiTags('screening')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('screening')
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @UseGuards(SubscriberAuthGuard)
  @ApiOperation({ summary: 'Create a new Screening Tool' })
  @Post()
  create(@Body() createScreeningDto: CreateScreeningDto) {
    return this.screeningService.storeScreeningTool(createScreeningDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/migrationData')
  migrateData() {
    console.log('inside migration controller --->');
    return this.screeningService.scriptForMigrationSQLToMONGo();
  }

  @UseGuards(AdminAuthGuard)
  @Get('/migrate-Health-Facility')
  scriptForMigratingHealthFacility() {
    console.log('inside migration controller in Health Facility--->');
    return this.screeningService.scriptForMigratingHealthFacility();
  }

  @UseGuards(AdminAuthGuard)
  @Get('/migrate-Subscriber')
  scriptForMigratingSubscriber() {
    console.log('inside migration controller in Subscriber--->');
    return this.screeningService.scriptForMigratingSubscriber();
  }
}
