import { PartialType } from '@nestjs/swagger';
import { CreateDynamicAlgorithmDto } from './create-dynamic-algorithm.dto';

export class UpdateDynamicAlgorithmDto extends PartialType(
  CreateDynamicAlgorithmDto,
) {}
