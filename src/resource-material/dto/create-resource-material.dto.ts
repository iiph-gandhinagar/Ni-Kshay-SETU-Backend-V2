import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateResourceMaterialDto {
  @ApiProperty({ description: 'Country id of the resource material' })
  @IsOptional()
  @IsMongoId()
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the resource material' })
  @IsNotEmpty()
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the resource material' })
  @IsOptional()
  @IsBoolean()
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre id of the resource material' })
  @IsNotEmpty()
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Option for state the resource material' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of the Resource Material' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Which Type of material to store' })
  @IsString()
  @IsNotEmpty()
  typeOfMaterials: string;

  @ApiProperty({
    description: 'Parent node where all resource material store',
  })
  @IsOptional()
  @IsMongoId()
  parentId: Types.ObjectId;

  @ApiProperty({ description: 'Folder Icon Type', required: false })
  @IsString()
  iconType?: string;

  @ApiProperty({ description: 'Index of Resource Material' })
  @IsNumber()
  index: number;

  @ApiProperty({ description: 'Admin User details' })
  @IsMongoId()
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Material Links', type: [String] })
  relatedMaterials: string[];
}
