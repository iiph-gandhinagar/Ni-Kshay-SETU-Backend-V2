import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class StoreWeeklyGoalDto {
  @ApiProperty({
    description: 'Goal of Weekly Assessment',
    example: '5',
  })
  @IsNotEmpty()
  @IsNumber()
  goal: number;
}
