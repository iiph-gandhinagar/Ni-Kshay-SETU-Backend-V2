import { PartialType } from '@nestjs/swagger';
import { CreateKbaseDto } from './create-kbase.dto';

export class UpdateKbaseDto extends PartialType(CreateKbaseDto) {}
