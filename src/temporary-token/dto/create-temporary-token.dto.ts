import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateTemporaryTokenDto {
  @ApiProperty({ description: 'Name of the Temporary Token' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email of the Temporary Token' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Token of the Temporary Token' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Expired Time and Date of Token',
    required: false,
  })
  @IsNotEmpty()
  @IsDate()
  expiredDate?: Date;

  @ApiProperty({ description: 'Admin User Id of the Temporary Token' })
  @IsNotEmpty()
  @IsMongoId()
  adminUserId: Types.ObjectId;
}
