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
import { CreateTemporaryTokenDto } from './dto/create-temporary-token.dto';
import { UpdateTemporaryTokenDto } from './dto/update-temporary-token.dto';
import { TemporaryTokenService } from './temporary-token.service';

@Controller('temporary-token')
@ApiTags('temporary-token')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class TemporaryTokenController {
  constructor(private readonly temporaryTokenService: TemporaryTokenService) {}

  @Post()
  create(@Body() createTemporaryTokenDto: CreateTemporaryTokenDto) {
    return this.temporaryTokenService.create(createTemporaryTokenDto);
  }

  @Get()
  findAll() {
    return this.temporaryTokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.temporaryTokenService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTemporaryTokenDto: UpdateTemporaryTokenDto,
  ) {
    return this.temporaryTokenService.update(+id, updateTemporaryTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.temporaryTokenService.remove(+id);
  }
}
