import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class TokenVerificationDto {
  @ApiProperty({ description: 'Email of the Temporary Token' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Token of the Temporary Token' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'Password for the admin user' })
  @IsString()
  @Length(8, 128)
  @Prop({ required: true })
  password: string;
}
