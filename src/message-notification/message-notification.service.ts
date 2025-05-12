import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import csvParser from 'csv-parser';
import * as dotenv from 'dotenv';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/pagination.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { Readable } from 'stream';
import { CreateMessageNotificationDto } from './dto/create-message-notification.dto';
import { MessageNotificationDocument } from './entities/message-notification.entity';
dotenv.config();

@Injectable()
export class MessageNotificationService {
  private readonly apiKey = process.env.SMS_API_KEY_PROMOTION; // Your Textlocal API key
  constructor(
    @InjectModel('MessageNotification')
    private readonly messageNotificationModel: Model<MessageNotificationDocument>,
    @Inject(forwardRef(() => FilterService))
    private readonly filterService: FilterService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}
  async create(
    files: any,
    createMessageNotificationDto: CreateMessageNotificationDto,
  ) {
    console.log('This action adds a new Message Notification');
    const { message } = createMessageNotificationDto;
    console.log('message --->', message);
    console.log('files => ', files);
    if (!files || !files?.[0]?.buffer) {
      return this.baseResponse.sendError(
        400,
        'Uploaded file is missing or invalid',
        [],
      );
    }
    console.log('files buffer -->', files[0].buffer);
    const errors: string[] = []; // To store validation errors
    const messagesToInsert = []; // To store valid records

    const stream = Readable.from(files[0].buffer);

    const result = new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          const { user_name, phone_no } = row;

          let hasError = false;

          if (!user_name || user_name.trim() === '') {
            errors.push(`files ${JSON.stringify(row)}: Name is required.`);
            hasError = true;
          }

          if (!phone_no || phone_no.length !== 10 || !/^\d+$/.test(phone_no)) {
            errors.push(
              `files ${JSON.stringify(row)}: Phone number must be 10 digits.`,
            );
            hasError = true;
          }

          if (!hasError) {
            messagesToInsert.push({
              userName: user_name,
              phoneNo: phone_no,
              message: message,
            });
          }
        })
        .on('end', async () => {
          if (errors.length > 0) {
            return reject(new BadRequestException(errors));
          }

          try {
            const result =
              await this.messageNotificationModel.insertMany(messagesToInsert);
            await this.sendingNotification(messagesToInsert, message);
            resolve(result);
          } catch (insertError) {
            reject(
              new BadRequestException(
                `Failed to insert records: ${insertError.message}`,
              ),
            );
          }
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(`Failed to process file: ${error.message}`),
          );
        });
    });
    const inserted = await result;
    return this.baseResponse.sendResponse(
      200,
      'Notifications are send Successfully!!',
      inserted,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    console.log('This action returns all Message Notification');
    const query = await this.filterService.filter(paginationDto);
    return await paginate(
      this.messageNotificationModel,
      paginationDto,
      [],
      query,
    );
  }

  async sendingNotification(record: any, message: string) {
    const numbers: string[] = [];
    for (const records of record) {
      numbers.push(`91${records.phoneNo}`); // Prefix with country code
    }
    const apiUrl = 'https://api.textlocal.in/send/?';
    try {
      // Make API request to send SMS
      const payload = new URLSearchParams({
        apiKey: this.apiKey,
        numbers: numbers.join(','), // Convert array to comma-separated string
        message: message,
        sender: '617548',
      }).toString();
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      });

      // Log the response
      console.log(`SMS API Response: ${JSON.stringify(response.data)}`);
      return response.data; // Return response for further processing if needed
    } catch (error) {
      // Log and rethrow any errors
      console.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }
}
