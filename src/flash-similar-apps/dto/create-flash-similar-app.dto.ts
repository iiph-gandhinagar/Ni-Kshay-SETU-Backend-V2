import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFlashSimilarAppDto {
  @ApiProperty({ description: 'Title of the Flash Similar Apps' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Sub Title of the Flash Similar Apps' })
  @IsString()
  @IsNotEmpty()
  subTitle: string;

  @ApiProperty({ description: 'Href of the Flash Similar Apps' })
  @IsString()
  @IsNotEmpty()
  href: string;

  @ApiProperty({ description: 'Href Web of the Flash Similar Apps' })
  @IsString()
  @IsNotEmpty()
  hrefWeb: string;

  @ApiProperty({ description: 'Href ios of the Flash Similar Apps' })
  @IsString()
  @IsNotEmpty()
  hrefIos: string;

  @ApiProperty({ description: 'Order Index of the Flash Similar Apps' })
  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @ApiProperty({
    description: 'Active Status of Flash Similar Apps',
    default: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean = true;
}
