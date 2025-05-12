import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateSubscriberDto } from './create-subscriber.dto';

export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {
  @ApiProperty({ description: 'Email of the Subscriber' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone No of the Subscriber' })
  @IsString()
  @IsNotEmpty()
  phoneNo: string;
}
