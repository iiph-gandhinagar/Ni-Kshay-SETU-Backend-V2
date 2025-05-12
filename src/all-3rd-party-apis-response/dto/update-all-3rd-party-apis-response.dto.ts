import { PartialType } from '@nestjs/swagger';
import { CreateAll3rdPartyApisResponseDto } from './create-all-3rd-party-apis-response.dto';

export class UpdateAll3rdPartyApisResponseDto extends PartialType(
  CreateAll3rdPartyApisResponseDto,
) {}
