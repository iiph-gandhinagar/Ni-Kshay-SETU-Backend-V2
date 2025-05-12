import { PartialType } from '@nestjs/swagger';
import { CreateUserAppVersionDto } from './create-user-app-version.dto';

export class UpdateUserAppVersionDto extends PartialType(
  CreateUserAppVersionDto,
) {}
