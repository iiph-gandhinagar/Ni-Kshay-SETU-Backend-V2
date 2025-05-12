import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmCgcInterventionDto } from './create-algorithm-cgc-intervention.dto';

export class UpdateAlgorithmCgcInterventionDto extends PartialType(
  CreateAlgorithmCgcInterventionDto,
) {}
