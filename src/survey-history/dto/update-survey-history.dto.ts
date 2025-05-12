import { PartialType } from '@nestjs/swagger';
import { CreateSurveyHistoryDto } from './create-survey-history.dto';

export class UpdateSurveyHistoryDto extends PartialType(
  CreateSurveyHistoryDto,
) {}
