import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ActiveFlagDto {
  @ApiProperty({
    description: 'The ID of the module',
    example: '2447',
  })
  @IsNotEmpty()
  @IsString()
  assessmentId: string;

  @ApiProperty({
    description: 'Active Status',
    example: 'true',
  })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
