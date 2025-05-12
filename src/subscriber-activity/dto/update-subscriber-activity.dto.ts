import { PartialType } from '@nestjs/swagger';
import { CreateSubscriberActivityDto } from './create-subscriber-activity.dto';

export class UpdateSubscriberActivityDto extends PartialType(
  CreateSubscriberActivityDto,
) {}
