import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateStaticTestimonialDto {
  @ApiProperty({ description: 'Title of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  @Unique('static-testimonial', 'name', { message: 'name must be unique' })
  name: object;

  @ApiProperty({ description: 'Description of the Key Features' })
  @IsNotEmpty()
  @IsObject()
  description: object;

  @ApiProperty({ description: 'orderIndex of the Key Features' })
  @IsNotEmpty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ description: 'Active flag for key Features' })
  @IsBoolean()
  active: boolean;
}
