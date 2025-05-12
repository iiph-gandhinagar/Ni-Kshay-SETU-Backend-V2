import { PartialType } from '@nestjs/swagger';
import { CreateStaticEnquiryDto } from './create-static-enquiry.dto';

export class UpdateStaticEnquiryDto extends PartialType(
  CreateStaticEnquiryDto,
) {}
