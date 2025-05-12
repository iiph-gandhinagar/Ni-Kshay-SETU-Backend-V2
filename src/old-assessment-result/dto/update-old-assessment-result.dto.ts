import { PartialType } from '@nestjs/swagger';
import { CreateOldAssessmentResultDto } from './create-old-assessment-result.dto';

export class UpdateOldAssessmentResultDto extends PartialType(
  CreateOldAssessmentResultDto,
) {}
