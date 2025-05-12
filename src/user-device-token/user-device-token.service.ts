import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose, { Model } from 'mongoose';
import * as path from 'path';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { ChatConversionDocument } from 'src/chat-conversion/entities/chat-conversion.entity';
import { message } from 'src/common/assets/message.asset';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { DeleteAccountCountDocument } from 'src/delete-account-count/entities/delete-account-count.entity';
import { FeedbackHistoryDocument } from 'src/feedback-history/entities/feedback-history.entity';
import { KbaseUserHistoryDocument } from 'src/kbase/entities/kbaseHistory.entity';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { StoreDeviceTokenDTO } from 'src/subscriber/dto/store-device-token.dto';
import { SubscriberDocument } from 'src/subscriber/entities/subscriber.entity';
import { SurveyHistoryDocument } from 'src/survey-history/entities/survey-history.entity';
import { UserAppVersionDocument } from 'src/user-app-version/entities/user-app-version.entity';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';
import { UserNotificationDocument } from 'src/user-notification/entities/user-notification.entity';
import { RemoveNotificationTokenDTO } from './dto/remove-device-token.dto';
dotenv.config();

@Injectable()
export class UserDeviceTokenService {
  constructor(
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
    @InjectModel('Subscriber')
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel('AssessmentResponse')
    private readonly assessmentResponseModel: Model<AssessmentResponseDocument>,
    @InjectModel('FeedbackHistory')
    private readonly feedbackHistoryModel: Model<FeedbackHistoryDocument>,
    @InjectModel('KbaseUserHistory')
    private readonly kbaseUserHistoryModel: Model<KbaseUserHistoryDocument>,
    @InjectModel('ChatConversion')
    private readonly chatConversionModel: Model<ChatConversionDocument>,
    @InjectModel('SubscriberActivity')
    private readonly subscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('SubscriberProgressHistory')
    private readonly subscriberProgressHistoryModel: Model<SubscriberProgressHistoryDocument>,
    @InjectModel('SurveyHistory')
    private readonly surveyHistoryModel: Model<SurveyHistoryDocument>,
    @InjectModel('UserAppVersion')
    private readonly userAppVersionModel: Model<UserAppVersionDocument>,
    @InjectModel('UserNotification')
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @InjectModel('DeleteAccountCount')
    private readonly deleteAccountCountModel: Model<DeleteAccountCountDocument>,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => BaseResponse))
    private readonly baseResponse: BaseResponse,
  ) {}

  async storeUserDeviceToken(
    userId: string,
    storeDeviceTokenDto: StoreDeviceTokenDTO,
  ) {
    console.log(`This Action store device token of subscriber`);
    const { deviceId, notificationToken } = storeDeviceTokenDto;
    console.log(`Device token and notification token -->`, deviceId);
    const existingToken = await this.userDeviceTokenModel.findOne({
      deviceId: deviceId,
    });
    if (existingToken) {
      console.log(`Inside existing user update token`);
      await this.userDeviceTokenModel.updateOne(
        { deviceId: deviceId },
        {
          notificationToken: notificationToken,
          userId: new mongoose.Types.ObjectId(userId),
        },
      );
      return this.baseResponse.sendResponse(
        200,
        message.userDeviceToken.USER_DEVICE_TOKEN_CREATED,
        [],
      );
    } else {
      console.log(`Inside create new user token`);
      await this.userDeviceTokenModel.create({
        deviceId,
        notificationToken,
        userId: new mongoose.Types.ObjectId(userId),
        isActive: 1,
      });
      return this.baseResponse.sendResponse(
        200,
        message.userDeviceToken.USER_DEVICE_TOKEN_CREATED,
        [],
      );
    }
  }

  async removeNotificationToken(
    userId: string,
    removeNotificationTokenDto: RemoveNotificationTokenDTO,
  ) {
    const { deviceId } = removeNotificationTokenDto;

    const userDeviceToken = await this.userDeviceTokenModel.findOneAndDelete({
      userId,
      deviceId,
    });

    if (!userDeviceToken) {
      throw new HttpException(
        {
          message: 'No such device found for this user!',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.baseResponse.sendResponse(
      200,
      message.userDeviceToken.USER_DEVICE_TOKEN_DELETE,
      [],
    );
  }

  async scriptUserDeviceToken() {
    const fullPath = path.resolve(
      __dirname,
      '/home/hi/Downloads/Old_User_device_tokens.json',
    );
    const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const record of jsonData) {
      if (record.deletedAt == '') {
        console.log('inside if --->');
        const userId = await this.subscriberModel.findOne({
          id: record.userId,
        });
        const result = {
          userId: userId._id,
          deviceId: record.deviceId,
          notificationToken: record.notificationToken,
          isActive: record.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await new this.userDeviceTokenModel(result).save();
      }
    }
  }
  async deleteAccount(userId: string, reason: string) {
    console.log(
      `Delete user Details -->${new mongoose.Types.ObjectId(userId)}`,
    );
    try {
      await this.assessmentResponseModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.chatConversionModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.feedbackHistoryModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.kbaseUserHistoryModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.subscriberActivityModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.subscriberProgressHistoryModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.surveyHistoryModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.userAppVersionModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.userDeviceTokenModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      await this.userNotificationModel.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
      const subscriber = await this.subscriberModel.findById(userId).populate([
        { path: 'cadreId', select: 'title' },
        { path: 'stateId', select: 'title' },
        { path: 'districtId', select: 'title' },
        { path: 'countryId', select: 'title' },
        { path: 'healthFacilityId', select: 'healthFacilityCode' },
        { path: 'blockId', select: 'title' },
      ]);

      await this.deleteAccountCountModel.findOneAndUpdate(
        {},
        {
          $inc: { count: 1 },
          type: 'deleteAccount',
        },
        { upsert: true, new: true },
      );
      await this.subscriberModel.deleteOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      await this.emailService.sendDeleteAccountDetail(
        process.env.EMAIL_FROM,
        subscriber,
        reason,
      );
      return this.baseResponse.sendResponse(
        200,
        'Account Deleted successfully!!',
        [],
      );
    } catch (error) {
      console.error('❌ Error processing Delete account:', error);
      throw new HttpException(
        {
          message: 'Error processing Delete account:',
          errors: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
