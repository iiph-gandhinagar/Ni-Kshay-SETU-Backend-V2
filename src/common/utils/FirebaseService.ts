import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { Model } from 'mongoose';
import { UserDeviceTokenDocument } from 'src/user-device-token/entities/user-device-token.entities';

dotenv.config();

@Injectable()
export class FirebaseService {
  constructor(
    @InjectModel('UserDeviceToken')
    private readonly userDeviceTokenModel: Model<UserDeviceTokenDocument>,
  ) {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(process.env.FIREBASE_CREDENTIALS),
      });
    }
  }
  async sendMulticastNotificationInBatches(
    tokens: string[], // Array of device tokens
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (tokens.length === 0) {
      console.log('No device tokens found for selected subscribers.');
      return { error: 'No device token found for selected subscriber.' };
    }
    const BATCH_SIZE = 500;
    const tokenChunks = this.chunkArray(tokens, BATCH_SIZE);
    let successFullCount = 0;
    let failedCount = 0;

    for (const chunk of tokenChunks) {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens: chunk,
      };

      try {
        const sendReport = await admin
          .messaging()
          .sendEachForMulticast(message);
        successFullCount += sendReport.successCount;
        failedCount += sendReport.failureCount;

        if (sendReport.failureCount > 0) {
          console.log('Unsuccessful tokens:');
          sendReport.responses.forEach((response, index) => {
            if (response.error) {
              if (response.error.code === 'messaging/unknown-token') {
                console.log(`Deleting invalid token: ${chunk[index]}`);
              }
            }
          });

          const unknownTokens = sendReport.responses
            .map((response, index) => (response.error ? chunk[index] : null))
            .filter((token) => token);

          if (unknownTokens.length > 0) {
            console.log('Unknown tokens:', unknownTokens);
            // Delete unknown tokens from your database as needed
            await this.userDeviceTokenModel.deleteMany({
              notificationToken: { $in: [unknownTokens] },
            });
          }
        }
      } catch (error) {
        console.error('Error sending multicast notification:', error);
        return { error: 'Error Sending multicast Notification' };
      }
    }

    return { successFullCount, failedCount };
  }

  async sendAllTypeOfNotification(
    notificationData: any,
    deviceTokens: any[],
    type: string,
  ) {
    console.log('inside send All Type Of Notifications-->');
    const title = notificationData['title'];
    const body = notificationData['description'];
    let link;
    if (type == 'survey') {
      link = { link: `${process.env.FRONTEND_URL}/surveyTool` };
    } else if (
      type == 'resourceMaterial' ||
      type == 'algorithm' ||
      type == 'general' ||
      type == 'query2coe'
    ) {
      link = { link: notificationData['link'] };
    } else if (type == 'leaderboard') {
      link = { link: `${process.env.FRONTEND_URL}/Tasks` };
    } else if (type == 'assessment') {
      console.log('notification title', notificationData['assessmentTitle']);
      link = {
        assessmentTitle:
          notificationData && notificationData.assessmentTitle !== ''
            ? notificationData['assessmentTitle'].en
            : '',
        timeToComplete:
          notificationData &&
          notificationData.timeToComplete &&
          notificationData.timeToComplete !== ''
            ? notificationData['timeToComplete'].toString()
            : '',
        link: notificationData['link'],
        label: 'Start Assessment Now',
      };
    } else if (type == 'deep-linking') {
      link = {
        type: 'Achievement',
        oldLevel: notificationData['oldLevel'],
        currentLevel: notificationData['currentLevel'],
        oldBadge: notificationData['oldBadge'],
        currentBadge: notificationData['currentBadge'],
      };
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: link,
    };
    const notify = await this.sendNotificationToDevices(deviceTokens, message);
    console.log('after sendNotification To device function call -->');
    if (notify.successFullCount !== undefined) {
      // Return the success and failed counts
      return {
        successFullCount: notify.successFullCount,
        failedCount: notify.failedCount,
      };
    } else {
      // Return the error message from the response
      return { error: notify.error };
    }
  }

  async sendNotificationToDevices(deviceTokens: any[], message: object) {
    if (deviceTokens.length === 0) {
      console.log('No device tokens found for selected subscribers.');
      return { error: 'No device token found for selected subscriber.' };
    }

    let successFullCount = 0;
    let failedCount = 0;

    const tokenArray = deviceTokens.map(
      (deviceToken) => deviceToken.notificationToken,
    );
    console.log('tokenArray --->', tokenArray.length);
    const chunkedTokens = this.chunkArray(tokenArray, 500); // Chunk the tokens into batches of 500

    for (const chunk of chunkedTokens) {
      const multicastMessage = {
        ...message,
        tokens: chunk,
      };
      try {
        const sendReport = await admin
          .messaging()
          .sendEachForMulticast(multicastMessage);

        console.log(`Successful sends: ${sendReport.successCount}`);
        console.log(`Failed sends: ${sendReport.failureCount}`);

        successFullCount += sendReport.successCount;
        failedCount += sendReport.failureCount;

        if (sendReport.failureCount > 0) {
          console.log('Unsuccessful tokens:');
          sendReport.responses.forEach((response, index) => {
            if (response.error) {
              if (response.error.code === 'messaging/unknown-token') {
                console.log(`Deleting invalid token: ${chunk[index]}`);
              }
            }
          });

          const unknownTokens = sendReport.responses
            .map((response, index) => (response.error ? chunk[index] : null))
            .filter((token) => token);

          if (unknownTokens.length > 0) {
            console.log('Unknown tokens:', unknownTokens);
            // Delete unknown tokens from your database as needed
            await this.userDeviceTokenModel.deleteMany({
              notificationToken: { $in: unknownTokens },
            });
          }
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }
    console.log('after send to all subscribers --->');
    return { successFullCount, failedCount };
  }

  // Helper method to split an array into chunks
  private chunkArray(arr: any[], chunkSize: number): any[][] {
    const results = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      results.push(arr.slice(i, i + chunkSize));
    }
    return results;
  }
}
