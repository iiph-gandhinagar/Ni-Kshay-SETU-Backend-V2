import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type All3rdPartyApisResponseDocument = All3rdPartyApisResponse &
  Document;

@Schema({ timestamps: true })
export class All3rdPartyApisResponse {
  @ApiProperty({ description: 'Api name' })
  @Prop({ type: String, required: true })
  api: string;

  @ApiProperty({ description: 'Status of api' })
  @Prop({ type: String, required: true })
  status: string;

  @ApiProperty({ description: 'Error message /message' })
  @Prop({ type: String, required: true })
  message: string;
}

export const All3rdPartyApisResponseSchema = SchemaFactory.createForClass(
  All3rdPartyApisResponse,
);
