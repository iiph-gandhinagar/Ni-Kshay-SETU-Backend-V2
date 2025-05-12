import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateAdminUserDto {
  @ApiProperty({ description: 'First name of the admin user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the admin user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address of the admin user' })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Unique('admin-user', 'email', { message: 'email address must be unique' })
  email: string;

  @ApiProperty({ description: 'profile Pic of the admin user' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Password for the admin user' })
  @IsString()
  @Length(8, 128)
  password: string;

  @ApiProperty({ description: 'Role of the user' })
  @IsNotEmpty()
  @IsMongoId()
  role: Types.ObjectId;

  @ApiProperty({ description: 'Role type of the admin user' })
  @IsString()
  @IsNotEmpty()
  roleType: string;

  @ApiProperty({ description: 'Country of the admin user' })
  @IsOptional()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State of the admin user' })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  state: Types.ObjectId[];

  @ApiProperty({ description: 'District of the admin user' })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  district: Types.ObjectId[];

  @ApiProperty({ description: 'Cadre of the admin user' })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  cadre: Types.ObjectId[];
  createAdminUserDto: Types.ObjectId;
}
