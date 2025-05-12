import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateAppConfigDto {
  @ApiProperty({ description: 'Key of the App Config' })
  @IsNotEmpty()
  @IsString()
  @Unique('app-config', 'key', { message: 'Key must be unique' })
  key: string;

  @ApiProperty({ description: 'Value of the App Config' })
  @IsNotEmpty()
  @IsObject()
  value: object;
}
