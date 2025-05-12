import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmGuidanceOnAdverseDrugReactionDto } from './create-algorithm-guidance-on-adverse-drug-reaction.dto';

export class UpdateAlgorithmGuidanceOnAdverseDrugReactionDto extends PartialType(
  CreateAlgorithmGuidanceOnAdverseDrugReactionDto,
) {}
