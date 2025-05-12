import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateMasterInstituteDto {
  @ApiProperty({ description: 'Title of Institutes' })
  @IsString()
  @IsNotEmpty()
  @Unique('master-institute', 'title', { message: 'title must be unique' })
  title: string;

  @ApiProperty({ description: 'Role of Institutes' })
  @IsMongoId()
  @IsNotEmpty()
  role: Types.ObjectId;

  @ApiProperty({ description: 'Parent Institute ID' })
  @IsOptional()
  @IsMongoId()
  parentId?: Types.ObjectId;

  @ApiProperty({ description: 'Country ID of the Institute' })
  @IsNotEmpty()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State ID of the Institute' })
  @IsOptional()
  @IsMongoId()
  stateId?: Types.ObjectId;

  @ApiProperty({ description: 'District ID of the Institute' })
  @IsOptional()
  @IsMongoId()
  districtId?: Types.ObjectId;

  @ApiProperty({ description: 'Created by Admin User' })
  @IsOptional()
  @IsMongoId()
  createdBy: Types.ObjectId;
}
