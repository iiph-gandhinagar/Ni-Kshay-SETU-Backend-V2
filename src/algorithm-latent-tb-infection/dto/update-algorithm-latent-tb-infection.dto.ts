import { PartialType } from '@nestjs/swagger';
import { CreateAlgorithmLatentTbInfectionDto } from './create-algorithm-latent-tb-infection.dto';

export class UpdateAlgorithmLatentTbInfectionDto extends PartialType(
  CreateAlgorithmLatentTbInfectionDto,
) {}
