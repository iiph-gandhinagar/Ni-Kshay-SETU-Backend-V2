/*
 * This controller is responsible for generating abbreviations
 * from full names or phrases, such as converting
 * 'Pradhan Mantri TB Mukt Bharat Abhiyan' to 'PMTBMBA'.
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
import { Permissions } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AuthGuard } from 'src/jwt/jwt-auth.guard';
import { PermissionsGuard } from 'src/jwt/permission.guard';
import { AbbreviationService } from './abbreviation.service';
import { CreateAbbreviationDto } from './dto/create-abbreviation.dto';
import { UpdateAbbreviationDto } from './dto/update-abbreviation.dto';

@ApiTags('abbreviation')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('abbreviation')
export class AbbreviationController {
  constructor(private readonly abbreviationService: AbbreviationService) {}

  @ApiOperation({ summary: 'Create a new Abbreviation' })
  @UseGuards(AuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.abbreviation.create')
  @Post()
  create(@Body() createAbbreviationDto: CreateAbbreviationDto) {
    return this.abbreviationService.create(createAbbreviationDto);
  }

  @ApiOperation({ summary: 'Get All Abbreviation Without Pagination' })
  @Get('get-all-abbreviation')
  findData() {
    return this.abbreviationService.findData();
  }

  @ApiOperation({ summary: 'Get All Abbreviation' })
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @UseGuards(PermissionsGuard)
  @Permissions('admin.abbreviation.index')
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.abbreviationService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Abbreviation by id' })
  @UseGuards(AuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.abbreviation.index')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abbreviationService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Abbreviation by id' })
  @UseGuards(AuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.abbreviation.edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAbbreviationDto: UpdateAbbreviationDto,
  ) {
    return this.abbreviationService.update(id, updateAbbreviationDto);
  }

  @ApiOperation({ summary: 'Delete Abbreviation by id' })
  @UseGuards(AuthGuard)
  @UseGuards(PermissionsGuard)
  @Permissions('admin.abbreviation.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.abbreviationService.remove(id);
  }
}
