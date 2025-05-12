import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class DeleteMemberDto {
  @ApiProperty({ description: 'Institute Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  instituteId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  subscriberId: Types.ObjectId;
}
