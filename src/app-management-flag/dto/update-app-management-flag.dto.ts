import { PartialType } from '@nestjs/swagger';
import { CreateAppManagementFlagDto } from './create-app-management-flag.dto';

export class UpdateAppManagementFlagDto extends PartialType(
  CreateAppManagementFlagDto,
) {}
