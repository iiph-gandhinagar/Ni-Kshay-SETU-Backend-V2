import { Injectable } from '@nestjs/common';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { FirebaseService } from './FirebaseService';

@Injectable()
export class NotificationQueueService {
  private queue;

  constructor(
    private readonly notificationService: FirebaseService,
    private readonly userNotificationService: UserNotificationService,
  ) {
    this.initQueue();
  }

  private async initQueue() {
    const { default: PQueue } = await eval("import('p-queue')");
    this.queue = new PQueue({ concurrency: 5 });
  }

  async addNotificationToQueue(
    notificationId: string,
    notificationData: any,
    deviceTokens: any[],
    type: string,
    batchSize: number = 500,
  ) {
    console.log(`This action create batch and send notifications`);
    const batches = this.splitIntoBatches(deviceTokens, batchSize);
    console.log('batches size--->', batches.length);
    let totalSuccess = 0;
    let totalFailed = 0;
    for (const batch of batches) {
      this.queue.add(async () => {
        try {
          // Process the notification
          const isSuccess =
            await this.notificationService.sendAllTypeOfNotification(
              notificationData,
              batch,
              type,
            );
          totalSuccess += isSuccess.successFullCount || 0;
          totalFailed += isSuccess.failedCount || 0;

          console.log(`Notification ${notificationId} processed successfully`);
        } catch (error) {
          totalFailed += batch.length;
          console.error(
            `Failed to process notification ${notificationId}:`,
            error,
          );
        }
      });
    }
    await this.queue.onIdle();
    // Update database based on result
    await this.updateNotificationCount(
      notificationId,
      totalSuccess,
      totalFailed,
    );
  }

  private splitIntoBatches(array: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  // Update the success/failure count in the database
  async updateNotificationCount(
    notificationId: string,
    successCount: number,
    failedCount: number,
  ) {
    console.log(
      'on update notification status --.',
      notificationId,
      successCount,
      failedCount,
    );
    await this.userNotificationService.updateOne(notificationId, {
      successfulCount: successCount,
      failedCount: failedCount,
      status: 'Done',
    });
  }
}
