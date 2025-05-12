import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type MasterInstituteDocument = MasterInstitute & Document;

@Schema({ timestamps: true })
export class MasterInstitute {
  @ApiProperty({ description: 'Title of Institutes' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ description: 'Role of Institutes' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @ApiProperty({ description: 'Title of Institutes' })
  @Prop({ type: Types.ObjectId, ref: 'MasterInstitute', required: false })
  parentId: Types.ObjectId;

  @ApiProperty({ description: 'Role of Institutes' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'Role of Institutes' })
  @Prop({ type: Types.ObjectId, ref: 'State', required: false })
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'Role of Institutes' })
  @Prop({ type: Types.ObjectId, ref: 'District', required: false })
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Created By Admin User' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  createdBy: Types.ObjectId;
}

export const MasterInstituteSchema =
  SchemaFactory.createForClass(MasterInstitute);
