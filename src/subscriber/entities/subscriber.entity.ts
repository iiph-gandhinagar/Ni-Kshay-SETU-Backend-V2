import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type SubscriberDocument = Subscriber & Document;

@Schema({ timestamps: true })
export class Subscriber {
  @ApiProperty({ description: 'Name of the Subscriber' })
  @Prop({ type: String, required: false })
  name: string;

  @ApiProperty({ description: 'Email of the Subscriber' })
  @Prop({ type: String, required: false }) //, unique: true
  email: string;

  @ApiProperty({ description: 'Phone No of the Subscriber' })
  @Prop({ type: String, required: false }) //, unique: true
  phoneNo: string;

  @ApiProperty({ description: 'Country Code of the Subscriber' })
  @Prop({ type: String, required: false })
  countryCode: string;

  @ApiProperty({ description: 'Password of the Subscriber' })
  @Prop({ type: String, required: false })
  password: string;

  @ApiProperty({ description: 'Cadre Type of the Subscriber' })
  @Prop({ type: String, required: false })
  cadreType: string;

  @ApiProperty({ description: 'Is Verified Flag of the Subscriber' })
  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Country id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'Country', required: false })
  countryId: Types.ObjectId;

  @ApiProperty({ description: 'State id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'State', required: false })
  stateId: Types.ObjectId;

  @ApiProperty({ description: 'Cadre id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'Cadre', required: false })
  cadreId: Types.ObjectId;

  @ApiProperty({ description: 'District id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'District', required: false })
  districtId: Types.ObjectId;

  @ApiProperty({ description: 'Block id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'Block', required: false })
  blockId: Types.ObjectId;

  @ApiProperty({ description: 'Health Facility id of the Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'HealthFacility', required: false })
  healthFacilityId: Types.ObjectId;

  @ApiProperty({ description: 'Profile pic of subscriber' })
  @Prop({ type: String, required: false })
  profileImage: string;

  @ApiProperty({ description: 'Forgot OTP time' })
  @Prop({ type: Date, required: false })
  forgotOtpTime: Date;

  @ApiProperty({ description: 'Status of user' })
  @Prop({ type: String, required: false })
  status: string;

  @ApiProperty({ description: 'Id of MYSQL' })
  @Prop({ type: Number, required: false })
  id: number;

  @ApiProperty({ description: 'OTP of the Subscriber' })
  @Prop({ type: Number, required: false })
  otp: number;

  @ApiProperty({ description: 'Expired Time and Date of OTP' })
  @Prop({ type: Date, required: false })
  expiredDate: Date;

  @ApiProperty({ description: 'Is Old User' })
  @Prop({ type: Boolean, default: false })
  isOldUser: boolean;

  @ApiProperty({ description: 'User Context Details' })
  @Prop({
    type: {
      chatHotQuestionOffset: { type: Number, required: false, default: 0 },
      feedbackHistory: {
        type: [
          {
            feedbackId: { type: Types.ObjectId, required: true },
            isCompleted: { type: Boolean, required: false },
            createdAt: { type: Date, required: false },
          },
        ],
        required: false,
      },
      queryDetails: {
        instituteId: {
          type: Types.ObjectId,
          ref: 'MasterInstitute',
          required: false,
        },
        type: {
          type: Types.ObjectId,
          ref: 'Role',
          required: false,
        } /* COE,NODAL,DRTB */,
        querySolved: { type: Number, required: false },
        isActive: { type: Boolean, default: true },
      },
      weeklyAssessmentCount: {
        type: Number,
        required: false,
        default: 0,
      },
    },
    required: false,
  })
  userContext: {
    chatHotQuestionOffset: number;
    feedbackHistory?: {
      feedbackId: Types.ObjectId;
      isCompleted: boolean;
      createdAt: Date;
    }[];
    queryDetails?: {
      instituteId: Types.ObjectId;
      type: Types.ObjectId;
      querySolved: number;
      isActive: boolean;
    };
    weeklyAssessmentCount?: number;
  };
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ phoneNo: 1 });
SubscriberSchema.index({ cadreId: 1 });
SubscriberSchema.index({
  _id: 1,
  countryId: 1,
  stateId: 1,
  districtId: 1,
  blockId: 1,
  healthFacilityId: 1,
});
