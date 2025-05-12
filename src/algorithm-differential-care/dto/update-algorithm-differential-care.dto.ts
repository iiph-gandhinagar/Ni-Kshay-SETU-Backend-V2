import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmDifferentialCareDto } from './create-algorithm-differential-care.dto';

export class UpdateAlgorithmDifferentialCareDto extends PartialType(
  CreateAlgorithmDifferentialCareDto,
) {}
