import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAssessmentCertificateDto {
  @ApiProperty({ description: 'Title of Certificate' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Top Value To set Content in Certificate' })
  @IsNumber()
  top: number;

  @ApiProperty({ description: 'Left Value To set Content in Certificate' })
  @IsNumber()
  left: number;

  @ApiProperty({ description: 'image of Certificate' })
  @IsString()
  image: string;

  @ApiProperty({ description: 'Creation Admin User Details', type: String })
  @IsOptional()
  @IsMongoId()
  createdBy: Types.ObjectId;
}
