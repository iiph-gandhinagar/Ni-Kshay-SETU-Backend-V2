import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The name of the permission',
    example: 'read',
  })
  @IsString()
  @IsNotEmpty()
  @Unique('permission', 'name', { message: 'name must be unique' })
  name: string;

  @ApiProperty({
    description: 'The description of the permission',
    example: 'Allows read access to resources',
  })
  @IsString()
  @IsOptional()
  description: string;
}
