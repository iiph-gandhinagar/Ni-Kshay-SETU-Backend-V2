import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveNotificationTokenDTO {
  @IsNotEmpty()
  @IsString()
  // @Transform(({ value }) => value?.trim())
  deviceId: string;
}
