import { PartialType } from '@nestjs/swagger';
import { CreateAbbreviationDto } from './create-abbreviation.dto';

export class UpdateAbbreviationDto extends PartialType(CreateAbbreviationDto) {}
