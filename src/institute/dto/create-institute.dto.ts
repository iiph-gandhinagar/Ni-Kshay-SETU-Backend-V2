import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateInstituteDto {
  @ApiProperty({ description: 'Institute Id', type: String })
  @IsMongoId()
  @IsNotEmpty()
  instituteId: Types.ObjectId;

  @ApiProperty({ description: 'Role Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  role: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  subscriber: Types.ObjectId;

  @ApiProperty({ description: 'Email of Subscriber', type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password', type: String })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: 'Created By Admin User' })
  @IsMongoId()
  @IsOptional()
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Created By Manager User' })
  @IsMongoId()
  @IsOptional()
  createdByInstitute: Types.ObjectId;
}
