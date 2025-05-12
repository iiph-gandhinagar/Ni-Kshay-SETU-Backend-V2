import { PartialType } from '@nestjs/swagger';
import { CreateDeleteAccountCountDto } from './create-delete-account-count.dto';

export class UpdateDeleteAccountCountDto extends PartialType(
  CreateDeleteAccountCountDto,
) {}
