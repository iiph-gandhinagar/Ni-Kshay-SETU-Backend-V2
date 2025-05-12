import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class StoreManageTbDto {
  @ApiProperty({ description: 'Title of the Abbreviation' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Created By Admin User' })
  @IsMongoId()
  @IsOptional()
  createdBy: Types.ObjectId;
}
