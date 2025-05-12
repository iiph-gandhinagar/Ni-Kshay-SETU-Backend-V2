import { PartialType } from '@nestjs/swagger';
import { CreateStaticTestimonialDto } from './create-static-testimonial.dto';

export class UpdateStaticTestimonialDto extends PartialType(
  CreateStaticTestimonialDto,
) {}
