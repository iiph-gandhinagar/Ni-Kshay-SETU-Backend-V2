import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckHealthStatus {
  @ApiProperty({ description: 'App Version of App Management flag' })
  @IsNotEmpty()
  @IsString()
  appVersion: string;

  @ApiProperty({ description: 'Platform of the App Management' })
  @IsNotEmpty()
  @IsString()
  platform: string;
}
