import { PartialType } from '@nestjs/swagger';
import { CreateHealthFacilityDto } from './create-health-facility.dto';

export class UpdateHealthFacilityDto extends PartialType(
  CreateHealthFacilityDto,
) {}
