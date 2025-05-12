import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmTreatmentDto } from './create-algorithm-treatment.dto';

export class UpdateAlgorithmTreatmentDto extends PartialType(
  CreateAlgorithmTreatmentDto,
) {}
