import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class TransferManagerDto {
  @ApiProperty({ description: 'Title Of District' })
  @IsNotEmpty()
  @IsMongoId()
  subscriberId: Types.ObjectId;

  @ApiProperty({ description: 'Title Of District' })
  @IsOptional()
  @IsMongoId()
  subscriber: Types.ObjectId;

  @ApiProperty({ description: 'Email of Subscriber', type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password', type: String })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: 'Institute Id ', type: String })
  @IsOptional()
  @IsMongoId()
  instituteId: Types.ObjectId;
}
