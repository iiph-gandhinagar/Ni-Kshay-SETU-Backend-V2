import { PartialType } from '@nestjs/swagger';
import { CreateTemporaryTokenDto } from './create-temporary-token.dto';

export class UpdateTemporaryTokenDto extends PartialType(
  CreateTemporaryTokenDto,
) {}
