import { PartialType } from '@nestjs/swagger';
import { CreateStaticModuleDto } from './create-static-module.dto';

export class UpdateStaticModuleDto extends PartialType(CreateStaticModuleDto) {}
