import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import mongoose, { Model } from 'mongoose';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { message } from 'src/common/assets/message.asset';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { Readable } from 'stream';
import { fonts } from './loadFonts';

dotenv.config();

@Injectable()
export class PdfService {
  constructor(
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async generatePDF(
    userName: string,
    assessmentTitle: string,
    percentage: number,
    certificateImage: any,
    top: number,
    left: number,
  ): Promise<Readable> {
    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      content: [
        {
          image: certificateImage, //path.join(__dirname, '..', '..', 'images', 'Certificate.png'),
          fit: [850, 880], // Adjust size as needed
          alignment: 'center',
          absolutePosition: { x: 30, y: 0 },
        },
        {
          text: [
            {
              text: userName,
              fontSize: 40,
              color: '#f78809',
              font: 'Allura',
              lineHeight: 1.0, // [left, top, right, bottom]
            },
            '\n\n',
            {
              text: 'In recognition of your completion of the\n',
              fontSize: 20,
              color: '#444444',
              font: 'Times',
              lineHeight: 1.5, // [left, top, right, bottom]
            },
            {
              text: assessmentTitle,
              fontSize: 45,
              color: '#444444',
              bold: true,
              font: 'Allura',
              lineHeight: 1.0, // [left, top, right, bottom]
            },
            '\n',
            {
              text: 'in Ni-kshay Setu Application.\n',
              fontSize: 20,
              color: '#444444',
              font: 'Times',
              lineHeight: 1.5, // [left, top, right, bottom]
            },
            {
              text: 'You have achieved ',
              fontSize: 20,
              color: '#444444',
              font: 'Times',
              lineHeight: 1.5, // [left, top, right, bottom]
            },
            {
              text: percentage + ' points',
              fontSize: 20,
              color: '#444444',
              bold: true,
              font: 'Helvetica',
              lineHeight: 1.5, // [left, top, right, bottom]
            },
            '\n',
            {
              text: 'in the assessment. We congratulate you and present you this certificate of completion.\n',
              fontSize: 20,
              color: '#444444',
              font: 'Times',
              lineHeight: 1.5, // [left, top, right, bottom]
            },
          ],
          absolutePosition: { x: left, y: top }, // Use dynamic values here
          alignment: 'center',
        },
      ],
      defaultStyle: {
        font: 'Roboto',
      },
      pageOrientation: 'landscape',
    } as TDocumentDefinitions;

    const options = {
      // ...
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    const stream = new Readable();
    stream._read = () => {}; // No-op
    pdfDoc.on('data', (chunk) => stream.push(chunk)); // Push PDF chunks to the stream
    pdfDoc.on('end', () => stream.push(null)); // Signal end of stream

    pdfDoc.end(); // End the PDF document

    return stream;
  }

  async getAllCertificate(userId: string) {
    console.log(`This action returns all certificate of user ${userId} -->`);
    const certificate = await this.assessmentResponseModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isCalculated: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: '$assessmentId',
          mostRecentAssessment: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'assessments', // The name of the Assessment collection
          localField: '_id', // Field in the current collection (assessmentId)
          foreignField: '_id', // Field in the Assessment collection
          as: 'assessmentDetails', // Name for the resulting array
        },
      },
      {
        $unwind: '$assessmentDetails', // Unwind the array to get a single object
      },
    ]);
    return this.baseResponse.sendResponse(
      200,
      message.pdf.PDF_LIST,
      certificate,
    );
  }

  async getCertificate(userId: string, assessmentResponseId: string) {
    console.log(
      `This Action return certificate for user ${userId} and assessment ${assessmentResponseId}`,
    );
    const userName = await this.subscriberModel.findById(userId).select('name');
    const certificate = await this.assessmentResponseModel
      .findById(assessmentResponseId)
      .populate({
        path: 'assessmentId',
        select: 'title certificateType',
        populate: {
          path: 'certificateType', // Then populate the certificate Type inside assessment
          select: 'title image top left', // Select only the cadre name if needed
        },
      })
      .exec();
    const assessmentTitle = (certificate.assessmentId as any).title;
    const certificateImage =
      process.env.AWS_URL +
      (certificate.assessmentId as any).certificateType.image;
    const response = await axios.get(certificateImage, {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(response.data, 'binary');
    const percentage =
      certificate.totalMarks && certificate.totalMarks != 0
        ? Math.round((certificate.obtainedMarks / certificate.totalMarks) * 100)
        : 0;
    const top = (certificate.assessmentId as any).certificateType.top;
    const left = (certificate.assessmentId as any).certificateType.left;
    const stream = await this.generatePDF(
      userName.name,
      assessmentTitle.en,
      percentage,
      imageBuffer,
      top,
      left,
    );
    return this.baseResponse.sendResponse(200, message.pdf.PDF_LIST, stream);
  }
}
