import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStaticEnquiryDto {
  @ApiProperty({ description: 'Subject of the Enquiry' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message of the Enquiry' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'order Index of the Enquiry' })
  @IsNotEmpty()
  @IsString()
  email: string;
}
