import { PartialType } from '@nestjs/swagger';
import { CreateAutomaticNotificationDto } from './create-automatic-notification.dto';

export class UpdateAutomaticNotificationDto extends PartialType(
  CreateAutomaticNotificationDto,
) {}
