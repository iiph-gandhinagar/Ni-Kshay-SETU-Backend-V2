import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number = 1; // Default page value

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number = 25; // Default limit value

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  moduleName?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  isAllCadre?: string;

  @IsOptional()
  @IsString()
  healthFacilityCode?: string;

  @IsOptional()
  @IsString()
  cadreType?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString()
  cadre?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  stateCountry?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  healthFacility?: string;

  @IsOptional()
  @IsString()
  illness?: string;

  @IsOptional()
  @IsString()
  queryId?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  regimen?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  adminStateId?: string;

  @IsOptional()
  @IsString()
  adminDistrictId?: string;

  @IsOptional()
  @IsString()
  blocks?: string;

  @IsOptional()
  @IsString()
  states?: string;

  @IsOptional()
  @IsString()
  cadres?: string;

  @IsOptional()
  @IsString()
  districts?: string;

  @IsOptional()
  @IsString()
  countries?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  stateId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  stateIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsMongoId()
  countryId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  districtId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  districtIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  blockId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  blockIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  healthFacilityId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  healthFacilityIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  cadreId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  userCadreId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  cadreIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  surveyId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsMongoId({ each: true })
  assessmentId?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsMongoId({ each: true })
  primaryCadre?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsMongoId({ each: true })
  primaryCadres?: string[];

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  courseTitle?: string;

  @IsOptional()
  @IsString()
  typeOfMaterials?: string;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsMongoId()
  subscriber?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsMongoId({ each: true })
  cadreGroup?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  cadreTypes?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  userCadreType?: string[];

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  allDistrict?: string;

  @IsOptional()
  @IsString()
  allState?: string;

  @IsOptional()
  @IsString()
  allBlock?: string;

  @IsOptional()
  @IsString()
  currentPlatform?: string;

  @IsOptional()
  @IsString()
  queryRaisedRole?: string;

  @IsOptional()
  @IsString()
  causerId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  userIdFilter?: string[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  usersId?: string[];

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  actions?: string;

  @IsOptional()
  @IsString()
  assessmentTitle?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsNumber()
  obtainedMarks?: number;

  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @IsOptional()
  @IsString()
  queryRaisedInstitute?: string;

  @IsOptional()
  @IsString()
  queryRespondedInstitute?: string;

  @IsOptional()
  @IsString()
  raisedBy?: string;

  @IsOptional()
  @IsString()
  transferredInstitute?: string;

  @IsOptional()
  @IsString()
  respondedBy?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  qLevel?: string;

  @IsOptional()
  @IsString()
  instituteId?: string;

  @IsOptional()
  @IsString()
  institute?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  types?: string;

  @IsOptional()
  @IsString()
  phoneNo?: string;

  @IsOptional()
  @IsString()
  userPhoneNo?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  questions?: string;

  @IsOptional()
  @IsString()
  option1?: string;

  @IsOptional()
  @IsString()
  option2?: string;

  @IsOptional()
  @IsString()
  option3?: string;

  @IsOptional()
  @IsString()
  option4?: string;

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsString()
  symptomTitle?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  variable?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nodeType?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsNumber()
  timeToComplete?: number;

  @IsOptional()
  @IsString()
  feature?: string;

  @IsOptional()
  @IsString()
  assessmentType?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'; // or any other sorting order

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  badgeId?: string;

  @IsOptional()
  @IsString()
  fromDate: string;

  @IsOptional()
  @IsString()
  toDate: string;
}
