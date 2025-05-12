import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class TransferQueryDto {
  @ApiProperty({ description: 'Institute Id Details' })
  @IsString()
  @IsNotEmpty()
  instituteId: string;

  @ApiProperty({ description: 'Questions Array' })
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({
    each: true,
    message: 'Each question must be a valid MongoDB Object ID.',
  })
  questions: string[];
}
