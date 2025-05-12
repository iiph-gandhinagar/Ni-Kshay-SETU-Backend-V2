// src/kbase/dto/read-content.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReadContentDto {
  @ApiProperty({
    description: 'The ID of the module',
    example: '2447',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'The Audience Id',
    example: '2447',
  })
  @IsOptional()
  @IsString()
  audienceId: string;

  @ApiProperty({
    description: 'The ID of the module',
    example: '2447',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;

  @ApiProperty({
    description: 'The ID of the chapter',
    example: '2450',
  })
  @IsNotEmpty()
  @IsString()
  chapterId: string;

  @ApiProperty({
    description: 'The ID of the content',
    example: '391',
  })
  @IsNotEmpty()
  @IsString()
  contentId: string;
}
