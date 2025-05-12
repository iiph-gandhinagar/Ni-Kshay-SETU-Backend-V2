import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { CreateQueryDto } from './create-query.dto';

export class UpdateQueryDto extends PartialType(CreateQueryDto) {
  @ApiProperty({ description: 'Response of Query', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(?!\s*$).+/, {
    message: 'Response must not be empty or just whitespace',
  })
  response?: string;
}
