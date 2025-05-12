import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { AbbreviationService } from 'src/abbreviation/abbreviation.service';
import { AdminUsersService } from 'src/admin-users/admin-users.service';
import { AppConfigService } from 'src/app-config/app-config.service';
import { AppManagementFlagService } from 'src/app-management-flag/app-management-flag.service';
import { AssessmentService } from 'src/assessment/assessment.service';
import { BlockService } from 'src/block/block.service';
import { CadreService } from 'src/cadre/cadre.service';
import { CountryService } from 'src/country/country.service';
import { DistrictService } from 'src/district/district.service';
import { HealthFacilityService } from 'src/health-facility/health-facility.service';
import { MasterCmsService } from 'src/master-cms/master-cms.service';
import { MasterInstituteService } from 'src/master-institute/master-institute.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { PrimaryCadreService } from 'src/primary-cadre/primary-cadre.service';
import { QuestionBankService } from 'src/question-bank/question-bank.service';
import { ResourceMaterialService } from 'src/resource-material/resource-material.service';
import { RolesService } from 'src/roles/roles.service';
import { StateService } from 'src/state/state.service';
import { StaticAppConfigService } from 'src/static-app-config/static-app-config.service';
import { StaticBlogService } from 'src/static-blog/static-blog.service';
import { StaticFaqService } from 'src/static-faq/static-faq.service';
import { StaticKeyFeatureService } from 'src/static-key-feature/static-key-feature.service';
import { StaticTestimonialService } from 'src/static-testimonial/static-testimonial.service';
import { SubscriberService } from 'src/subscriber/subscriber.service';
import { SurveyMasterService } from 'src/survey-master/survey-master.service';
import { SymptomService } from 'src/symptom/symptom.service';
import { SystemQuestionService } from 'src/system-question/system-question.service';
import { TourService } from 'src/tour/tour.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => CountryService))
    private readonly countryService: CountryService,
    @Inject(forwardRef(() => PermissionsService))
    private readonly permissionService: PermissionsService,
    @Inject(forwardRef(() => StateService))
    private readonly stateService: StateService,
    @Inject(forwardRef(() => CadreService))
    private readonly cadreService: CadreService,
    @Inject(forwardRef(() => DistrictService))
    private readonly districtService: DistrictService,
    @Inject(forwardRef(() => BlockService))
    private readonly blockService: BlockService,
    @Inject(forwardRef(() => SymptomService))
    private readonly symptomService: SymptomService,
    @Inject(forwardRef(() => HealthFacilityService))
    private readonly healthFacilityService: HealthFacilityService,
    @Inject(forwardRef(() => ResourceMaterialService))
    private readonly resourceMaterialService: ResourceMaterialService,
    @Inject(forwardRef(() => AppConfigService))
    private readonly appConfigService: AppConfigService,
    @Inject(forwardRef(() => AppManagementFlagService))
    private readonly appManagementService: AppManagementFlagService,
    @Inject(forwardRef(() => StaticBlogService))
    private readonly staticBlogService: StaticBlogService,
    @Inject(forwardRef(() => StaticFaqService))
    private readonly staticFaqService: StaticFaqService,
    @Inject(forwardRef(() => StaticAppConfigService))
    private readonly staticAppConfigService: StaticAppConfigService,
    @Inject(forwardRef(() => StaticKeyFeatureService))
    private readonly staticKeyFeatureService: StaticKeyFeatureService,
    @Inject(forwardRef(() => StaticTestimonialService))
    private readonly staticTestimonialService: StaticTestimonialService,
    @Inject(forwardRef(() => TourService))
    private readonly tourService: TourService,
    @Inject(forwardRef(() => AbbreviationService))
    private readonly abbreviationService: AbbreviationService,
    @Inject(forwardRef(() => SystemQuestionService))
    private readonly systemQuestionService: SystemQuestionService,
    @Inject(forwardRef(() => SubscriberService))
    private readonly subscriberService: SubscriberService,
    @Inject(forwardRef(() => PrimaryCadreService))
    private readonly primaryCadreService: PrimaryCadreService,
    @Inject(forwardRef(() => MasterInstituteService))
    private readonly masterInstituteService: MasterInstituteService,
    @Inject(forwardRef(() => AssessmentService))
    private readonly assessmentService: AssessmentService,
    @Inject(forwardRef(() => QuestionBankService))
    private readonly questionBankService: QuestionBankService,
    @Inject(forwardRef(() => MasterCmsService))
    private readonly masterCmsService: MasterCmsService,
    @Inject(forwardRef(() => SurveyMasterService))
    private readonly surveyMasterService: SurveyMasterService,
    @Inject(forwardRef(() => AdminUsersService))
    private readonly adminUserService: AdminUsersService,
  ) {
    console.log('RolesService:', rolesService);
  }
  async validate(value: any, args: ValidationArguments) {
    let result: object;
    const [model, property] = args.constraints;
    if (model === 'country') {
      result = await this.countryService.findByProperty(property, value);
    } else if (model === 'role') {
      result = await this.rolesService.findByProperty(property, value);
    } else if (model === 'permission') {
      result = await this.permissionService.findByProperty(property, value);
    } else if (model === 'state') {
      result = await this.stateService.findByProperty(property, value);
    } else if (model === 'cadre') {
      result = await this.cadreService.findByProperty(property, value);
    } else if (model === 'district') {
      result = await this.districtService.findByProperty(property, value);
    } else if (model === 'block') {
      result = await this.blockService.findByProperty(property, value);
    } else if (model === 'symptom') {
      result = await this.symptomService.findByProperty(property, value);
    } else if (model === 'health-facility') {
      result = await this.healthFacilityService.findByProperty(property, value);
    } else if (model === 'resource-material') {
      result = await this.resourceMaterialService.findByProperty(
        property,
        value,
      );
    } else if (model === 'app-config') {
      result = await this.appConfigService.findByProperty(property, value);
    } else if (model === 'app-management') {
      result = await this.appManagementService.findByProperty(property, value);
    } else if (model === 'static-blog') {
      result = await this.staticBlogService.findByProperty(property, value);
    } else if (model === 'static-faq') {
      result = await this.staticFaqService.findByProperty(property, value);
    } else if (model === 'static-app-config') {
      result = await this.staticAppConfigService.findByProperty(
        property,
        value,
      );
    } else if (model === 'static-key-feature') {
      result = await this.staticKeyFeatureService.findByProperty(
        property,
        value,
      );
    } else if (model === 'static-testimonial') {
      result = await this.staticTestimonialService.findByProperty(
        property,
        value,
      );
    } else if (model === 'tour') {
      result = await this.tourService.findByProperty(property, value);
    } else if (model === 'abbreviation') {
      result = await this.abbreviationService.findByProperty(property, value);
    } else if (model === 'system-question') {
      result = await this.systemQuestionService.findByProperty(property, value);
    } else if (model === 'subscriber') {
      result = await this.subscriberService.findByProperty(property, value);
    } else if (model === 'primary-cadre') {
      result = await this.primaryCadreService.findByProperty(property, value);
    } else if (model === 'master-institute') {
      result = await this.masterInstituteService.findByProperty(
        property,
        value,
      );
    } else if (model === 'assessment') {
      result = await this.assessmentService.findByProperty(property, value);
    } else if (model === 'question-bank') {
      result = await this.questionBankService.findByProperty(property, value);
    } else if (model === 'master-cms') {
      result = await this.masterCmsService.findByProperty(property, value);
    } else if (model === 'survey-master') {
      result = await this.surveyMasterService.findByProperty(property, value);
    } else if (model === 'admin-user') {
      result = await this.adminUserService.findByProperty(property, value);
    }

    return !result; // return true if the document is not found, meaning it's unique
  }

  defaultMessage(args: ValidationArguments) {
    const [property] = args.constraints;
    return `${property} already exists.`;
  }
}

export function Unique(
  model: string,
  property: string,
  validationOptions?: ValidationOptions,
) {
  console.log('model and property ---->', property);
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [model, property],
      validator: IsUniqueConstraint,
    });
  };
}
