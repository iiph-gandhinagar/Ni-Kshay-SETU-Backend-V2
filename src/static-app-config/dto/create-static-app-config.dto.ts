import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateStaticAppConfigDto {
  @ApiProperty({ description: 'Key of the App Config' })
  @IsNotEmpty()
  @IsString()
  @Unique('static-app-config', 'key', { message: 'key must be unique' })
  key: string;

  @ApiProperty({ description: 'type of the App Config' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Value of the App Config' })
  @IsNotEmpty()
  @IsObject()
  value: object;
}
