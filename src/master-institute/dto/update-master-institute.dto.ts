import { PartialType } from '@nestjs/swagger';
import { CreateMasterInstituteDto } from './create-master-institute.dto';

export class UpdateMasterInstituteDto extends PartialType(
  CreateMasterInstituteDto,
) {}
