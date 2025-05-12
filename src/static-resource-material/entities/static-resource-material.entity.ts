import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type StaticResourceMaterialDocument = StaticResourceMaterial & Document;

@Schema({ timestamps: true })
export class StaticResourceMaterial {
  @ApiProperty({ description: 'Title of the Resource Material' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Type Of Material of Resource Material' })
  @Prop({
    type: String,
    required: true,
  })
  typeOfMaterials: string;

  @ApiProperty({ description: 'Material of Resource Material' })
  @Prop({ type: [String], required: true })
  material: string[];

  @ApiProperty({ description: 'order Index of Resource Material' })
  @Prop({ type: Number, required: true })
  orderIndex: number;

  @ApiProperty({ description: 'Active of the Resource Material' })
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaticResourceMaterialSchema = SchemaFactory.createForClass(
  StaticResourceMaterial,
);
