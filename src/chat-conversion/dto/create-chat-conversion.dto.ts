import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: 'Question of the message' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Answer of the message' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Type of the message' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Category of the message' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Platform of the message' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Like status of the message' })
  @IsBoolean()
  like: boolean;
}

export class CreateChatConversionDto {
  @ApiProperty({ description: 'Subscriber of the Chat conversations' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Message of the Chat conversations',
    type: [ChatMessageDto],
  })
  @IsArray()
  @IsObject({ each: true })
  message: ChatMessageDto[];

  @ApiProperty({ description: 'Session Id of the Chat conversations' })
  @IsString()
  sessionId: string;
}
