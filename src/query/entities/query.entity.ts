import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type QueryDocument = Query & Document;

@Schema({ timestamps: true })
export class Query {
  @ApiProperty({ description: 'Query Subscriber Age Details' })
  @Prop({ type: Number, required: true })
  age: number;

  @ApiProperty({ description: 'Query Subscriber sex Details' })
  @Prop({ type: String, required: true })
  sex: string;

  @ApiProperty({ description: 'Query Subscriber Diagnosis Details' })
  @Prop({ type: String, required: true })
  diagnosis: string;

  @ApiProperty({ description: 'Query Subscriber Date of Admission Details' })
  @Prop({ type: Date, required: true })
  dateOfAdmission: Date;

  @ApiProperty({ description: 'Query Subscriber Chief complaint Details' })
  @Prop({ type: String, required: true })
  chiefComplaint: string;

  @ApiProperty({
    description:
      'Query Subscriber History of present illness & duration (In case of ADR or CDST, Comorbidities Please mention here Details',
  })
  @Prop({ type: String, required: true })
  illness: string;

  @ApiProperty({
    description: 'Query Subscriber Past History/Follow Up History Details',
  })
  @Prop({ type: String, required: false })
  pastHistory: string;

  @ApiProperty({
    description:
      'Query Subscriber Pre Treatment Evaluation findings (Current episode) Details',
  })
  @Prop({ type: String, required: false })
  preTreatmentEvaluation: string;

  @ApiProperty({
    description:
      'Query Subscriber Assessment and Differential Diagnosis Details',
  })
  @Prop({ type: String, required: false })
  assessmentAndDiffDiagnosis: string;

  @ApiProperty({ description: 'Current Treatment Plan (Regimen) Details' })
  @Prop({ type: String, required: true })
  currentTreatmentPlan: string;

  @ApiProperty({ description: 'Query Details' })
  @Prop({ type: String, required: true })
  query: string;

  @ApiProperty({ description: 'Generate Query Id Details' })
  @Prop({ type: String, required: true })
  queryId: string;

  @ApiProperty({ description: 'Response of Query' })
  @Prop({ type: String, required: false })
  response: string;

  @ApiProperty({ description: 'Query raised by Subscriber of DRTB' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  raisedBy: Types.ObjectId;

  @ApiProperty({ description: 'Query responded by Subscriber name' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: false })
  respondedBy: Types.ObjectId;

  @ApiProperty({ description: 'Query transferred by Subscriber of DRTB' })
  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: false })
  transferredBy: Types.ObjectId;

  @ApiProperty({ description: 'Query responded by Admin User name' })
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: false })
  transferredByAdmin: Types.ObjectId;

  @ApiProperty({ description: 'Query Raised Role of Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  queryRaisedRole: Types.ObjectId;

  @ApiProperty({ description: 'Query Responded Role of Subscriber' })
  @Prop({ type: Types.ObjectId, ref: 'Role', required: false })
  queryRespondedRole: Types.ObjectId;

  @ApiProperty({ description: 'Query Raised Institute' })
  @Prop({ type: Types.ObjectId, ref: 'MasterInstitute', required: true })
  queryRaisedInstitute: Types.ObjectId;

  @ApiProperty({ description: 'Query Responded Institute' })
  @Prop({ type: Types.ObjectId, ref: 'MasterInstitute', required: false })
  queryRespondedInstitute: Types.ObjectId;

  @ApiProperty({ description: 'Status of Query' })
  @Prop({ type: String, required: false })
  status: string;

  @ApiProperty({ description: 'Like Status of response' })
  @Prop({ type: Boolean, required: false, default: false })
  like: boolean;

  @ApiProperty({ description: 'Dislike Status of response' })
  @Prop({ type: Boolean, required: false, default: false })
  dislike: boolean;

  @ApiProperty({ description: 'History of Queries' })
  @Prop({ type: [Object], required: false })
  payload: object[];
}

export const QuerySchema = SchemaFactory.createForClass(Query);
