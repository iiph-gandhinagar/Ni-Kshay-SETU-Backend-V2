import { PartialType } from '@nestjs/swagger';
import { CreateChatConversionDto } from './create-chat-conversion.dto';

export class UpdateChatConversionDto extends PartialType(
  CreateChatConversionDto,
) {}
