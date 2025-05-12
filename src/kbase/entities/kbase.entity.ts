import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type KbaseDocument = Kbase & Document;

@Schema()
export class ContentPage {
  @ApiProperty({ description: 'Content Title' })
  @Prop({ type: String, required: false })
  contentTitle: string;

  @ApiProperty({ description: 'Content Id' })
  @Prop({ type: String, required: false })
  contentId: string;

  @ApiProperty({ description: 'H5P Ids' })
  @Prop({ type: [String], required: false }) // change to array of strings
  h5pIds: string[];
}

const ContentPageSchema = SchemaFactory.createForClass(ContentPage);

// Chapter Schema
@Schema()
export class Chapter {
  @ApiProperty({ description: 'Chapter Title' })
  @Prop({ type: String, required: false })
  chapterTitle: string;

  @ApiProperty({ description: 'Chapter Id' })
  @Prop({ type: String, required: false })
  chapterId: string;

  @ApiProperty({ description: 'Content Pages' })
  @Prop({ type: [ContentPageSchema], required: false })
  contentPage: ContentPage[];
}

const ChapterSchema = SchemaFactory.createForClass(Chapter);

// Module Schema
@Schema()
export class Module {
  @ApiProperty({ description: 'Module Title' })
  @Prop({ type: String, required: false })
  moduleTitle: string;

  @ApiProperty({ description: 'Module Id' })
  @Prop({ type: String, required: false })
  moduleId: string;

  @ApiProperty({ description: 'Chapters' })
  @Prop({ type: [ChapterSchema], required: false })
  chapter: Chapter[];
}

const ModuleSchema = SchemaFactory.createForClass(Module);

@Schema({ timestamps: true })
export class Kbase {
  @ApiProperty({ description: 'Total Module Counts' })
  @Prop({ type: Number, required: true })
  totalModule: number;

  @ApiProperty({ description: 'Total Chapters Counts' })
  @Prop({ type: Number, required: true })
  totalChapter: number;

  @ApiProperty({ description: 'Total Content Counts' })
  @Prop({ type: Number, required: true })
  totalContent: number;

  @ApiProperty({ description: 'Cadre Title' })
  @Prop({ type: [String], required: true })
  cadreTitle: string[];

  @ApiProperty({ description: 'Cadre Id' })
  @Prop({ type: [Number], required: true })
  cadreId: number[];

  @ApiProperty({ description: 'Course Title' })
  @Prop({ type: String, required: true })
  courseTitle: string;

  @ApiProperty({ description: 'Course Id' })
  @Prop({ type: Number, required: true })
  courseId: number;

  @ApiProperty({ description: 'Total Module Counts' })
  @Prop({ type: [ModuleSchema], required: false })
  module: [];
}

export const KbaseSchema = SchemaFactory.createForClass(Kbase);
