import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type InstituteDocument = Institute & Document;

@Schema({ timestamps: true })
export class Institute {
  @ApiProperty({ description: 'Institute Name' })
  @Prop({ type: Types.ObjectId, ref: 'MasterInstitute', required: true })
  instituteId: Types.ObjectId;

  @ApiProperty({ description: 'Role Name' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @ApiProperty({ description: 'Subscriber Name' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  subscriber: Types.ObjectId;

  @ApiProperty({ description: 'Email of Subscriber' })
  @Prop({ Type: String, required: true })
  email: string;

  @ApiProperty({ description: 'password' })
  @Prop({ type: String, required: false })
  password: string;

  @ApiProperty({ description: 'Created By Admin User' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: false })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Created By Admin User' })
  @Prop({ type: Types.ObjectId, ref: 'Institute', required: false })
  createdByInstitute: Types.ObjectId;
}

export const InstituteSchema = SchemaFactory.createForClass(Institute);
