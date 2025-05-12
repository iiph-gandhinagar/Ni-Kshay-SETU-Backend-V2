import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackHistoryDto } from './create-feedback-history.dto';

export class UpdateFeedbackHistoryDto extends PartialType(
  CreateFeedbackHistoryDto,
) {}
