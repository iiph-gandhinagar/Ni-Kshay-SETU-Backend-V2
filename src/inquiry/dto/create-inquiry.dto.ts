import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateInquiryDto {
  @ApiProperty({ description: 'Inquiry User Id' })
  @IsOptional()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Inquiry User Name' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Inquiry User Email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Inquiry User PhoneNo' })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  phoneNo: string;

  @ApiProperty({ description: 'Inquiry User Subject' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Inquiry User Message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'Inquiry User Type' })
  @IsOptional()
  @IsString()
  type: string;
}
