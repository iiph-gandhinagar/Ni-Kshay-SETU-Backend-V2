import { PartialType } from '@nestjs/swagger';
import { CreateDynamicAlgoMasterDto } from './create-dynamic-algo-master.dto';

export class UpdateDynamicAlgoMasterDto extends PartialType(
  CreateDynamicAlgoMasterDto,
) {}
