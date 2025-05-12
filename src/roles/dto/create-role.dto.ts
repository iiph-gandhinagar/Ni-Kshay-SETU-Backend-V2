import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Unique } from 'src/common/decorators/unique.validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'Admin',
  })
  @IsString()
  @IsNotEmpty()
  @Unique('role', 'name', { message: 'name must be unique' })
  name: string;

  @ApiProperty({
    description: 'The description of the role',
    example: 'Administrator with full access',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The Permission of the role',
  })
  @IsArray()
  @IsString({ each: true })
  permission: string[];
}
