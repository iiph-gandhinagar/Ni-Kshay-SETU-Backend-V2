import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dotenv from 'dotenv';
import mongoose, { Model, PopulateOptions } from 'mongoose';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { WatiService } from 'src/common/utils/wati.service';
import { fonts } from 'src/pdf/loadFonts';
import { PrescriptionDocument } from 'src/prescription/entities/prescription.entity';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { UploadController } from 'src/upload/upload.controller';
import { Readable } from 'stream';
import { CreateManageTbDto } from './dto/create-manage-tb.dto';
import { SendPrescriptionOnPhone } from './dto/send-prescription-on-phone.dto';
import { StoreManageTbDto } from './dto/store-manage-tb.dto';
import { ManageTbDocument } from './entities/manage-tb.entity';
dotenv.config();
@Injectable()
export class ManageTbService {
  constructor(
    @InjectModel('ManageTb')
    private readonly manageTbModel: Model<ManageTbDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('Prescription')
    private readonly prescriptionModel: Model<PrescriptionDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
    @Inject(forwardRef(() => WatiService))
    private readonly wati: WatiService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UploadController))
    private readonly uploadController: UploadController,
  ) {}
  async create(createManageTbDto: CreateManageTbDto) {
    console.log(`This action adds a new manageTb${createManageTbDto}`);
    try {
      const url = `${process.env.MANAGE_TB_URL}/update_cells_v2/`;
      const apiResponse = (await axios.post(url, createManageTbDto))?.data;
      await this.prescriptionModel.create(apiResponse.data);
      console.log(`api response : ${apiResponse}`);
      return this.baseResponse.sendResponse(
        200,
        'Prescription Details!!',
        apiResponse,
      );
    } catch (error) {
      console.log('❌ ERROR: python service issue ');
      console.log(JSON.stringify(error));
      return this.baseResponse.sendResponse(
        200,
        'Python Api response Error!!',
        error,
      );
    }
  }

  async storeChangesOfManageTB(
    storeManageTb: StoreManageTbDto,
    userId: string,
  ) {
    console.log(
      `This action adds a new manageTb Changes Details ${storeManageTb}`,
    );
    storeManageTb.createdBy = new mongoose.Types.ObjectId(userId);
    const newManageTb = await this.manageTbModel.create(storeManageTb);
    // const manageTb = await newManageTb.save();
    /*  Call Python api */
    const url = `${process.env.MANAGE_TB_URL}/delete_and_create_sheets`;
    await axios.get(url);
    return this.baseResponse.sendResponse(
      200,
      message.manageTb.MANAGE_TB_CREATED,
      newManageTb,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all App Config');
    const statePopulateOptions: PopulateOptions[] = [
      { path: 'createdBy', select: 'firstName lastName email' }, // Populate countryId and select only the name field
    ];
    const query = await this.filterService.filter(paginationDto);

    return await paginate(
      this.manageTbModel,
      paginationDto,
      statePopulateOptions,
      query,
    );
  }

  async sessionApi() {
    try {
      console.log(`This action create new session Id and duplicate workbook`);
      const url = `${process.env.MANAGE_TB_URL}/start_session/`;
      const apiResponse = (await axios.post(url))?.data;
      return this.baseResponse.sendResponse(200, 'WorkBook Id!!', apiResponse);
    } catch (error) {
      console.log('❌ ERROR: python service issue ');
      console.log(JSON.stringify(error));
      return this.baseResponse.sendResponse(
        200,
        'Python Api response Error!!',
        error,
      );
    }
  }

  async generatePDF(
    notes: string,
    diagnosis: string,
    regimen: string,
    prescription: string,
  ): Promise<Readable> {
    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      content: [
        {
          image: 'src/common/images/Poppins font.jpg',
          width: 100,
          alignment: 'center',
        },
        {
          text: 'Nikshay-SETU', // Spacer before footer
          alignment: 'center',
          bold: true,
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515, // Adjust this value to the page width minus margins
              y2: 0,
              lineWidth: 1, // Thickness of the line
              lineColor: '#000000', // Line color (black in this case)
            },
          ],
          margin: [0, 10, 0, 10], // Adds some spacing around the line
        },
        {
          text: '\n\n', // Spacer before footer
        },
        {
          table: {
            headerRows: 0,
            widths: ['auto', '*'],
            body: [
              [{ text: 'Diagnosis:', style: 'tableHeader' }, diagnosis],
              [{ text: 'Regimen:', style: 'tableHeader' }, regimen],
              [{ text: 'Prescription:', style: 'tableHeader' }, prescription],
              [{ text: 'Notes:', style: 'tableHeader' }, notes],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: '\n\n', // Spacer before footer
        },
        { text: 'Disclaimer:', bold: true, fontSize: 8 },
        {
          text: '\n', // Spacer before footer
        },
        {
          text: 'This application is designed to assist healthcare professionals in creating TB treatment regimens, aligning with National TB Management Guidelines. It functions as a decision-support tool and should not replace the expertise of qualified medical professionals. The Clinical Decision Support System (CDSS) within the app is intended to aid in regimen development, but ultimate medical decisions must be made by healthcare providers.',
          fontSize: 8,
        },
        {
          text: 'Always consult a qualified healthcare provider for accurate diagnosis and personalized treatment recommendations.',
          fontSize: 8,
          bold: true,
        },
        {
          text: 'The information provided in this app is for reference purposes only and should not be used as a sole source for medical decision-making. The use of this app is subject to specific terms and conditions.',
          fontSize: 8,
          italics: true,
        },
        {
          text: '\n\n', // Spacer before footer
        },
        {
          image: 'src/common/images/final_pdf_image.png',
          width: 320,
          height: 160,
          alignment: 'center',
        },
      ],
      styles: {
        tableHeader: { bold: true, fontSize: 12, margin: [0, 5, 0, 5] },
        tableContent: { fontSize: 10, margin: [0, 5, 0, 5] },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      pageOrientation: 'portrait',
    } as TDocumentDefinitions;

    const options = {}; // Your options here

    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    const stream = new Readable();
    stream._read = () => {};
    pdfDoc.on('data', (chunk) => stream.push(chunk));
    pdfDoc.on('end', () => stream.push(null));
    pdfDoc.end();

    return stream;
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async sendPrescriptionOnWhatsApp(
    sendPrescriptionOnPhone: SendPrescriptionOnPhone,
    userId: string,
  ) {
    console.log(`This Action sends Prescription details on WhatsApp No.`);
    const { prescription } = sendPrescriptionOnPhone;
    console.log('phoneNo prescription -->', prescription);
    try {
      const userName = await this.subscriberModel
        .findById(userId)
        .select('name phoneNo');

      prescription.name = userName.name;

      await this.wati.sendTemplateMessage(
        `91${userName.phoneNo}`,
        prescription,
      );
      return this.baseResponse.sendResponse(
        200,
        'Send Prescription successfully!!',
        [],
      );
    } catch (error) {
      console.log('❌ ERROR: Send Prescription on whatsApp Issue ');
      console.log(JSON.stringify(error));
      return this.baseResponse.sendResponse(
        200,
        'Send Prescription on whatsApp Issue',
        error,
      );
    }
  }

  async downloadPrescription(sendPrescriptionOnPhone: SendPrescriptionOnPhone) {
    console.log(`This Action sends Prescription details on WhatsApp No.`);
    const { prescription } = sendPrescriptionOnPhone;
    console.log('phoneNo prescription -->', prescription);
    try {
      const stream = await this.generatePDF(
        prescription.notes,
        prescription.diagnosis,
        prescription.regimen,
        prescription.prescription,
      );

      return this.baseResponse.sendResponse(
        200,
        'Prescription Details!!',
        stream,
      );
    } catch (error) {
      console.log('❌ ERROR: Download Prescription Issue ');
      console.log(JSON.stringify(error));
      return this.baseResponse.sendResponse(
        200,
        'Download Prescription Issue!!',
        error,
      );
    }
  }

  async emailPrescription(
    sendPrescriptionOnPhone: SendPrescriptionOnPhone,
    userId: string,
  ) {
    console.log(`Email prescription`);
    const { prescription } = sendPrescriptionOnPhone;
    console.log('phoneNo prescription -->', prescription);
    try {
      const userName = await this.subscriberModel
        .findById(userId)
        .select('name phoneNo email');
      console.log('user email--->', userName.email);
      prescription.name = userName.name;
      if (!userName.email) {
        throw new HttpException(
          {
            message: 'email Update!',
            errors: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const pdfStream = await this.downloadPrescription(
        sendPrescriptionOnPhone,
      );
      /* Send Prescription to email */
      await this.emailService.sendPrescription(
        userName.email,
        userName.name,
        pdfStream.data,
      );
      return this.baseResponse.sendResponse(200, 'Prescription Details!!', []);
    } catch (error) {
      console.log('❌ ERROR: Email service Issue (manage tb)');
      console.log(JSON.stringify(error));
      return this.baseResponse.sendResponse(
        200,
        'Email service Issue (manage tb)',
        error,
      );
    }
  }
}
