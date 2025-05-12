import { PartialType } from '@nestjs/swagger';
import { CreateProAssessmentResponseDto } from './create-pro-assessment-response.dto';

export class UpdateProAssessmentResponseDto extends PartialType(
  CreateProAssessmentResponseDto,
) {}
