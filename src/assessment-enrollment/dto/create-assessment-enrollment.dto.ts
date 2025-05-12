import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAssessmentEnrollmentDto {
  @ApiProperty({ description: 'Assessment ID', type: String })
  @IsMongoId()
  assessmentId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber/User ID', type: String })
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Response of Subscriber', required: false })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiProperty({ description: 'Send Notification status' })
  @IsBoolean()
  sendInitialInvitation: boolean;
}
