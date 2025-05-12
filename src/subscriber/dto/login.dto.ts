import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ description: 'Login With Phone No', required: false })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Either phone number or email must be provided' })
  @IsString()
  phoneNo?: string;

  @ApiProperty({ description: 'Login With Email', required: false })
  @ValidateIf((o) => !o.phoneNo)
  @IsNotEmpty({ message: 'Either phone number or email must be provided' })
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Password Detail' })
  @IsNotEmpty()
  @IsNumber()
  otp: number;
}
