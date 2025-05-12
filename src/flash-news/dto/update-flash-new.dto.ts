import { PartialType } from '@nestjs/swagger';
import { CreateFlashNewDto } from './create-flash-new.dto';

export class UpdateFlashNewDto extends PartialType(CreateFlashNewDto) {}
