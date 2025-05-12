import { PartialType } from '@nestjs/swagger';
import { CreateAssessmentResponseDto } from './create-assessment-response.dto';

export class UpdateAssessmentResponseDto extends PartialType(
  CreateAssessmentResponseDto,
) {}
