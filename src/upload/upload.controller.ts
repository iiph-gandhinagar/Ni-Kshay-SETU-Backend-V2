/**
 * Controller responsible for handling file upload operations.
 *
 * This controller provides an endpoint to upload multiple files
 * along with additional data in the request body. It utilizes
 * the `AnyFilesInterceptor` to handle multipart/form-data requests.
 *
 * @module UploadController
 */
// src/upload/upload.controller.ts

import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { uploadDocumentService } from 'src/common/utils/awsServices';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(AnyFilesInterceptor()) // Intercept multipart/form-data (multiple files)
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[], // Uploaded files
    @Body() body: any, // Request body (data)
  ) {
    try {
      const result = await uploadDocumentService(body, files);
      return {
        code: 200,
        status: true,
        message: 'Files uploaded successfully',
        data: result,
      };
    } catch (error) {
      return {
        code: 400,
        status: false,
        message: 'Error uploading files',
        error: error.message,
      };
    }
  }
}
