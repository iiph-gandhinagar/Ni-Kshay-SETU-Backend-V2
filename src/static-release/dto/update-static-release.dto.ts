import { PartialType } from '@nestjs/swagger';
import { CreateStaticReleaseDto } from './create-static-release.dto';

export class UpdateStaticReleaseDto extends PartialType(
  CreateStaticReleaseDto,
) {}
