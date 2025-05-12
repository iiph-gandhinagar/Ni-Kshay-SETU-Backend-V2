import { PartialType } from '@nestjs/swagger';
import { CreateStaticKeyFeatureDto } from './create-static-key-feature.dto';

export class UpdateStaticKeyFeatureDto extends PartialType(
  CreateStaticKeyFeatureDto,
) {}
