import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmDiagnosisDto } from './create-algorithm-diagnosis.dto';

export class UpdateAlgorithmDiagnosisDto extends PartialType(
  CreateAlgorithmDiagnosisDto,
) {}
