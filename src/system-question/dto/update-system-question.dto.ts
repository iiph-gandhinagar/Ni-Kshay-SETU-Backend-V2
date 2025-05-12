import { PartialType } from '@nestjs/swagger';
import { CreateSystemQuestionDto } from './create-system-question.dto';

export class UpdateSystemQuestionDto extends PartialType(
  CreateSystemQuestionDto,
) {}
