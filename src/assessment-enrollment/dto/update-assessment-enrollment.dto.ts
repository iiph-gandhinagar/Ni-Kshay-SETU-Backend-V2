import { PartialType } from '@nestjs/swagger';
import { CreateAssessmentEnrollmentDto } from './create-assessment-enrollment.dto';

export class UpdateAssessmentEnrollmentDto extends PartialType(
  CreateAssessmentEnrollmentDto,
) {}
