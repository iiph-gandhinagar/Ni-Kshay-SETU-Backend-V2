// watch-type.service.ts
import { Injectable } from '@nestjs/common';
import { SubscriberProgressService } from 'src/subscriber-progress/subscriber-progress.service';

@Injectable()
export class WatchTypeService {
  constructor(private readonly SubscriberProgress: SubscriberProgressService) {}
  async handleDbEvent(actionType: any) {
    // console.log(actionArray, '----------------actionType.operationType');
    switch (actionType.operationType) {
      case 'insert':
        // update by Action
        const actionArray = [
          'Chat Keyword Fetched',
          'Search By Keyword Fetched',
          'user_home_page_visit',
        ].includes(actionType?.fullDocument?.action);
        actionArray &&
          this.SubscriberProgress.updateSubscriberProgress(
            actionType.fullDocument,
          );
        // update By module
        const subModuleUsage =
          actionType?.fullDocument?.action === 'submodule_usage';
        subModuleUsage &&
          this.SubscriberProgress.updateSubModuleUsageCount(
            actionType.fullDocument,
          );
        const appUsage =
          actionType?.fullDocument?.module === 'overall_app_usage';
        appUsage &&
          this.SubscriberProgress.updateOverallAppUsageMinSpent(
            actionType.fullDocument,
          );
        break;
      default:
        console.warn(`Unhandled operation type: ${actionType.operationType}`);
        break;
    }
  }

  async UpdateDbEvent(change: any) {
    const taskId = change.documentKey._id;

    // Fetch the updated document
    const updatedFields = change.updateDescription?.updatedFields || {};
    console.log(`Updated fields for taskId ${taskId}:`, updatedFields);

    // Call the task update function if necessary
    try {
      await this.SubscriberProgress.updateCompletedTask(taskId);
    } catch (error) {
      console.error(`Error in UpdateDbEvent for taskId ${taskId}:`, error);
    }
  }

  async AssessmentDbEvent(userId: any) {
    userId && (await this.SubscriberProgress.updateCompletedAssessment(userId));
  }
}
