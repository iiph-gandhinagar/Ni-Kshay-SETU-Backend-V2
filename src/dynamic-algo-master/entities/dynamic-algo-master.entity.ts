import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type DynamicAlgoMasterDocument = DynamicAlgoMaster & Document;

@Schema({ timestamps: true })
export class DynamicAlgoMaster {
  @ApiProperty({ description: 'title of dynamic Algo' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Icon of dynamic Algorithm' })
  @Prop({ type: String, required: false })
  icon: string;

  @ApiProperty({ description: 'Status of Dynamic Algo' })
  @Prop({ type: Boolean, default: false })
  active: boolean;
}

export const DynamicAlgoMasterSchema =
  SchemaFactory.createForClass(DynamicAlgoMaster);
