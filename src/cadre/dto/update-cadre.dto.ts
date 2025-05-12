import { PartialType } from '@nestjs/swagger';
import { CreateCadreDto } from './create-cadre.dto';

export class UpdateCadreDto extends PartialType(CreateCadreDto) {}
