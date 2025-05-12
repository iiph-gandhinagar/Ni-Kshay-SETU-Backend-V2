import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

// export type ResourceMaterialDocument = ResourceMaterial & Document;

@Schema({ timestamps: true })
export class ResourceMaterial {
  @ApiProperty({ description: 'Country id of the resource material' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: false })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the resource material' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'State' }], required: true })
  stateId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of State' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'Cadre id of the resource material' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cadre' }], required: true })
  cadreId: Types.ObjectId[];

  @ApiProperty({ description: 'All Flag Of Cadre' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;

  @ApiProperty({ description: 'Title of the Resource Material' })
  @Prop({ type: Object, required: true })
  title: object;

  @ApiProperty({ description: 'Which Type of material to store' })
  @Prop({ type: String, required: true })
  typeOfMaterials: string;

  @ApiProperty({ description: 'Parent node where all resource material store' })
  @Prop({ type: Types.ObjectId, ref: 'ResourceMaterial', required: false })
  parentId: Types.ObjectId | null;

  @ApiProperty({ description: 'Folder Icon Type' })
  @Prop({ type: String, required: false })
  iconType: string;

  @ApiProperty({ description: 'Index of Resource Material' })
  @Prop({ type: Number, required: true })
  index: number;

  @ApiProperty({ description: 'Created Admin User details' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Array of related resource material IDs' })
  @Prop({ type: [String] })
  relatedMaterials: string[];

  @ApiProperty({ description: 'Id of Mysql' })
  @Prop({ type: Number, required: false })
  id: number;
}

export const ResourceMaterialSchema =
  SchemaFactory.createForClass(ResourceMaterial);

// Virtual field to define children relationship
ResourceMaterialSchema.virtual('children', {
  ref: 'ResourceMaterial',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true, // Set to true if you expect only one child per parent
});

// Ensure virtual fields are included in JSON output
ResourceMaterialSchema.set('toObject', { virtuals: true });
ResourceMaterialSchema.set('toJSON', { virtuals: true });

export type ResourceMaterialDocument = Document &
  ResourceMaterial & {
    children?: ResourceMaterialDocument[]; // Children are optional as they may not always be loaded
  };
