import { PartialType } from '@nestjs/swagger';
import { CreateStaticAppConfigDto } from './create-static-app-config.dto';

export class UpdateStaticAppConfigDto extends PartialType(
  CreateStaticAppConfigDto,
) {}
