import { PartialType } from '@nestjs/swagger';
import { CreateResourceMaterialDto } from './create-resource-material.dto';

export class UpdateResourceMaterialDto extends PartialType(
  CreateResourceMaterialDto,
) {}
