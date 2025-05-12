import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class userContextDTO {
  @ApiProperty({ description: 'Question of the message' })
  @IsOptional()
  @IsNumber()
  chatHotQuestionOffset: number = 0;

  @ApiProperty({ description: 'Weekly Assessment Goal Count' })
  @IsOptional()
  @IsNumber()
  weeklyAssessmentCount: number = 0;

  @ApiProperty({ description: 'Feedback History Details' })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  feedbackHistory: object[];

  @ApiProperty({ description: 'Query Details' })
  @IsOptional()
  @IsObject()
  queryDetails: object;
}

export class CreateSubscriberV2Dto {
  @ApiProperty({ description: 'Name of the Subscriber' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email of the Subscriber' })
  @ValidateIf((o) => o.phoneNo == null && o.phoneNo === '')
  @IsString({ message: 'email must be a string' })
  @Unique('subscriber', 'email', { message: 'email must be unique' })
  email: string;

  @ApiProperty({ description: 'Phone No of the Subscriber' })
  @IsOptional()
  @IsString()
  @Length(10, 10, {
    message: 'phoneNo must be exactly 10 characters long',
  })
  @Unique('subscriber', 'phoneNo', { message: 'phoneNo must be unique' })
  phoneNo: string;

  @ApiProperty({ description: 'Country Code of the Subscriber' })
  @ValidateIf((o) => o.phoneNo != null && o.phoneNo !== '')
  @IsString({ message: 'Country Code must be a string' })
  countryCode: string;

  @ApiProperty({ description: 'Password of the Subscriber' })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: 'Cadre Type of the Subscriber' })
  @IsString()
  @IsNotEmpty()
  cadreType: string;

  @ApiProperty({ description: 'Is Verified Flag of the Subscriber' })
  @IsBoolean()
  @IsOptional()
  isVerified: boolean;

  @ApiProperty({ description: 'Country id of the Subscriber' })
  @IsNotEmpty()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the Subscriber' })
  @ValidateIf(
    (o) =>
      o.cadreType != null &&
      o.cadreType !== 'National_Level' &&
      o.cadreType !== 'International_Level',
  )
  @IsMongoId()
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'Cadre id of the Subscriber' })
  @IsMongoId()
  @IsNotEmpty()
  cadreId: Types.ObjectId;

  @ApiProperty({ description: 'District id of the Subscriber' })
  @ValidateIf(
    (o) =>
      o.cadreType != null &&
      o.cadreType !== 'National_Level' &&
      o.cadreType !== 'International_Level' &&
      o.cadreType !== 'State_Level',
  )
  @IsMongoId()
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Block id of the Subscriber' })
  @ValidateIf(
    (o) =>
      o.cadreType != null &&
      o.cadreType !== 'National_Level' &&
      o.cadreType !== 'International_Level' &&
      o.cadreType !== 'District_Level' &&
      o.cadreType !== 'State_Level',
  )
  @IsMongoId()
  blockId: Types.ObjectId;

  @ApiProperty({ description: 'Health Facility id of the Subscriber' })
  @ValidateIf(
    (o) =>
      o.cadreType != null &&
      o.cadreType !== 'National_Level' &&
      o.cadreType !== 'International_Level' &&
      o.cadreType !== 'District_Level' &&
      o.cadreType !== 'State_Level' &&
      o.cadreType !== 'Block_Level',
  )
  @IsMongoId()
  healthFacilityId: Types.ObjectId;

  @ApiProperty({ description: 'profile Pic of the Subscriber' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Forgot OTP time of the Subscriber' })
  @IsOptional()
  @IsString()
  forgotOtpTime?: string;

  @ApiProperty({ description: 'Id of MYSQL' })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'isOldUser flag' })
  @IsBoolean()
  isOldUser: boolean = false;

  @ApiProperty({ description: 'User Context Details' })
  @IsObject()
  @IsOptional()
  userContext: userContextDTO;

  @ApiProperty({ description: 'Status of user' })
  @IsString()
  @IsOptional()
  status: string;
}
