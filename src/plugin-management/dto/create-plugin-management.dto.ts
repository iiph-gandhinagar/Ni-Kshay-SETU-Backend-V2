import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { OneOfTwoFields } from 'src/common/decorators/OneOfTwoFieldsConstraint.decorator';

export class CreatePluginManagementDto {
  @ApiProperty({ description: 'Plugin Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Cadre Type of plugin management' })
  @IsString()
  @IsNotEmpty()
  cadreType: string;

  @ApiProperty({ description: 'Cadre of Plugin Access subscriber' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'Cadre All Flag of the Survey' })
  @IsOptional()
  @IsBoolean()
  isAllCadre: boolean;

  @OneOfTwoFields('cadreId', 'isAllCadre', {
    message: 'cadreId: Either cadreId or isAllCadre Flag must be provided.',
  })
  validationField: string;
}
