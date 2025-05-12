import { PartialType } from '@nestjs/swagger';
import { CreatePrimaryCadreDto } from './create-primary-cadre.dto';

export class UpdatePrimaryCadreDto extends PartialType(CreatePrimaryCadreDto) {}
