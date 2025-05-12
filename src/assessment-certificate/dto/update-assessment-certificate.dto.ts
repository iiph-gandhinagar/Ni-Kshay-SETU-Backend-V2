import { PartialType } from '@nestjs/swagger';
import { CreateAssessmentCertificateDto } from './create-assessment-certificate.dto';

export class UpdateAssessmentCertificateDto extends PartialType(
  CreateAssessmentCertificateDto,
) {}
