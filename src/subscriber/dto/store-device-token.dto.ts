import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StoreDeviceTokenDTO {
  @ApiProperty({ description: 'Device Id of the User Device token' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Notification token of the User Device token' })
  @IsNotEmpty()
  @IsString()
  notificationToken: string;
}
