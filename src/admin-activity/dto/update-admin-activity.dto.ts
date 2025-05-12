import { PartialType } from '@nestjs/swagger';
import { CreateAdminActivityDto } from './create-admin-activity.dto';

export class UpdateAdminActivityDto extends PartialType(
  CreateAdminActivityDto,
) {}
