import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddMemberDto {
  @ApiProperty({ description: 'Institute Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  instituteId: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Name', type: String })
  @IsMongoId()
  @IsNotEmpty()
  subscriberId: Types.ObjectId;

  @ApiProperty({ description: 'Role of Institute', type: String })
  @IsString()
  @IsNotEmpty()
  instituteRole: string;

  @ApiProperty({ description: 'Active Status', type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
