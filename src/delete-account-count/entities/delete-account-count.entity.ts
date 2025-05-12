import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type DeleteAccountCountDocument = DeleteAccountCount & Document;

@Schema({ timestamps: true })
export class DeleteAccountCount {
  @ApiProperty({ description: 'Delete Account count' })
  @Prop({ type: Number, required: true })
  count: number;

  @ApiProperty({ description: 'Count Type' })
  @Prop({ type: String, required: true })
  type: string;
}

export const DeleteAccountCountSchema =
  SchemaFactory.createForClass(DeleteAccountCount);
