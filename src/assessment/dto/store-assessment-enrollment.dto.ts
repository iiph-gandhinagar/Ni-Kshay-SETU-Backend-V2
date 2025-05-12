import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class StoreAssessmentEnrollmentDto {
  @ApiProperty({
    description: 'Assessment ID',
    example: '6666c830eb18953046b1b56b',
  })
  @IsNotEmpty()
  @IsMongoId()
  assessmentId: string;

  @ApiProperty({
    description: 'response',
    example: 'abc',
  })
  @IsNotEmpty()
  response: string;
}
