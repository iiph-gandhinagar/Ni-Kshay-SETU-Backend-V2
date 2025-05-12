import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class StoreProAssessmentDto {
  @ApiProperty({
    description: 'Payload of Weekly Assessment',
    example: [
      {
        user_id: 'xzc129',
        assessment_id: '3dadc951-7a00-4c7f-8e82-35088c4652da',
        user_responses: [
          { nid: '3691', user_answer: 1 },
          { nid: '5825', user_answer: 3 },
          { nid: '8252', user_answer: 1 },
          { nid: '3095', user_answer: 1 },
          { nid: '4874', user_answer: 3 },
        ],
      },
    ],
  })
  @IsNotEmpty()
  @IsObject()
  payload: object;
}
