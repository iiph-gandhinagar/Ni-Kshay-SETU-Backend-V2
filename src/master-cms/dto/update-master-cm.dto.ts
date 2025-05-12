import { PartialType } from '@nestjs/swagger';
import { CreateMasterCmDto } from './create-master-cm.dto';

export class UpdateMasterCmDto extends PartialType(CreateMasterCmDto) {}
