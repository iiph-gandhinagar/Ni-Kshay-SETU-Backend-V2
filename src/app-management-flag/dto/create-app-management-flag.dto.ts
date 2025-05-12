import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateAppManagementFlagDto {
  @ApiProperty({ description: 'Variable of App Management flag' })
  @IsNotEmpty()
  @IsString()
  @Unique('app-management', 'variable', {
    message: 'variable must be unique',
  })
  variable: string;

  @ApiProperty({ description: 'Value of the App Management' })
  @IsNotEmpty()
  @IsObject()
  value: object;
}
