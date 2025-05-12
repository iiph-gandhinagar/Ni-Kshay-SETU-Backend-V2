import { PartialType } from '@nestjs/swagger';
import { CreateFlashSimilarAppDto } from './create-flash-similar-app.dto';

export class UpdateFlashSimilarAppDto extends PartialType(
  CreateFlashSimilarAppDto,
) {}
