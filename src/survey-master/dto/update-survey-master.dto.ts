import { PartialType } from '@nestjs/swagger';
import { CreateSurveyMasterDto } from './create-survey-master.dto';

export class UpdateSurveyMasterDto extends PartialType(CreateSurveyMasterDto) {}
