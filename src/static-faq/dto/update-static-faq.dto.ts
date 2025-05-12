import { PartialType } from '@nestjs/swagger';
import { CreateStaticFaqDto } from './create-static-faq.dto';

export class UpdateStaticFaqDto extends PartialType(CreateStaticFaqDto) {}
