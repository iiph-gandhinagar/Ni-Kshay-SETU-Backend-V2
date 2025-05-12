import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateStaticResourceMaterialDto {
  @ApiProperty({ description: 'Title of the Resource Material' })
  @IsNotEmpty()
  @IsObject()
  title: object;

  @ApiProperty({ description: 'Material of the Resource Material' })
  @IsNotEmpty()
  @IsString({ each: true })
  material: string[];

  @ApiProperty({ description: 'Type Of Material of the Resource Material' })
  @IsNotEmpty()
  @IsString()
  typeOfMaterials: string;

  @ApiProperty({ description: 'orderIndex of the Resource Material' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for Resource Material' })
  @IsBoolean()
  active: boolean;
}
