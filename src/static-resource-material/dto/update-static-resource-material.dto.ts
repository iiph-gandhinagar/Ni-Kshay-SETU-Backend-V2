import { PartialType } from '@nestjs/swagger';
import { CreateStaticResourceMaterialDto } from './create-static-resource-material.dto';

export class UpdateStaticResourceMaterialDto extends PartialType(
  CreateStaticResourceMaterialDto,
) {}
