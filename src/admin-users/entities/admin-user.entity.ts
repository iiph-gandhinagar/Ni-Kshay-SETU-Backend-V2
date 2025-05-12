import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AdminUser {
  @ApiProperty({ description: 'First name of the admin user' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ description: 'Last name of the admin user' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ description: 'Email address of the admin user' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'Profile pic of admin user' })
  @Prop({ type: String, required: false })
  profileImage: string;

  @ApiProperty({ description: 'Password for the admin user' })
  @IsString()
  @Length(8, 128)
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'Role of the user' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @ApiProperty({ description: 'Role type of the admin user' })
  @Prop({ required: true })
  roleType: string;

  @ApiProperty({ description: 'Country of the admin user' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: false })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State of the admin user' })
  @Prop({ type: [Types.ObjectId], ref: 'State', required: true })
  state: Types.ObjectId[];

  @ApiProperty({ description: 'All State flag' })
  @Prop({ type: Boolean, default: false })
  isAllState: boolean;

  @ApiProperty({ description: 'District of the admin user' })
  @Prop({ type: [Types.ObjectId], ref: 'District', required: true })
  district: Types.ObjectId[];

  @ApiProperty({ description: 'All District flag' })
  @Prop({ type: Boolean, default: false })
  isAllDistrict: boolean;

  @ApiProperty({ description: 'Cadre of the admin user' })
  @Prop({ type: [Types.ObjectId], ref: 'Cadre', required: true })
  cadre: Types.ObjectId[];

  @ApiProperty({ description: 'All Cadre flag' })
  @Prop({ type: Boolean, default: false })
  isAllCadre: boolean;
}

export type AdminUserDocument = AdminUser & Document;
export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
