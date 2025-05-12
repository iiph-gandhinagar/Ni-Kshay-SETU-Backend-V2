import { PartialType } from '@nestjs/swagger';
import { CreateSubscriberProgressDto } from './create-subscriber-progress.dto';

export class UpdateSubscriberProgressDto extends PartialType(
  CreateSubscriberProgressDto,
) {}
