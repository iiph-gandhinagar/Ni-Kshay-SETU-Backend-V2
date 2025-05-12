import { PartialType } from '@nestjs/swagger';
import { CreateMessageNotificationDto } from './create-message-notification.dto';

export class UpdateMessageNotificationDto extends PartialType(
  CreateMessageNotificationDto,
) {}
