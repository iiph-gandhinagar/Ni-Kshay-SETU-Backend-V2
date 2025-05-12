import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { PdfService } from './pdf.service';

@ApiTags('pdf')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(SubscriberAuthGuard)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @ApiOperation({ summary: 'Get certificate by  assessment id' })
  @Get(':responseId')
  async getCertificate(
    @Param('responseId') responseId: string,
    @Req() request,
    @Res() res: Response,
  ) {
    try {
      const { _id } = request.user;
      const pdfBuffer = await this.pdfService.getCertificate(_id, responseId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="certificate.pdf"',
      );
      // Pipe the PDF stream to the response
      pdfBuffer.data.pipe(res);
    } catch (error) {
      console.error('Error generating certificate:', error);
      res.status(500).send('Error generating certificate');
    }
  }
}
