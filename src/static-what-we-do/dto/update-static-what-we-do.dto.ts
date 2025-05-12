import { PartialType } from '@nestjs/swagger';
import { CreateStaticWhatWeDoDto } from './create-static-what-we-do.dto';

export class UpdateStaticWhatWeDoDto extends PartialType(
  CreateStaticWhatWeDoDto,
) {}
