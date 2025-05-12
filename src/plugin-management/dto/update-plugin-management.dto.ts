import { PartialType } from '@nestjs/swagger';
import { CreatePluginManagementDto } from './create-plugin-management.dto';

export class UpdatePluginManagementDto extends PartialType(
  CreatePluginManagementDto,
) {}
