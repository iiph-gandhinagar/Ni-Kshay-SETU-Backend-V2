// watcher.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriberActivityDocument } from 'src/subscriber-activity/entities/subscriber-activity.entity';
import { WatchTypeService } from './watch-type.service';
import { SubscriberProgressHistoryDocument } from 'src/subscriber-progress/entities/subscriber-progress-history';
import { AssessmentResponseDocument } from 'src/assessment-response/entities/assessment-response.entity';
import { MongoClient } from 'mongodb';

@Injectable()
export class WatcherService implements OnModuleInit {
  mongoClient: any;
  constructor(
    private readonly watchTypeService: WatchTypeService,
    @InjectModel('SubscriberActivity')
    private SubscriberActivityModel: Model<SubscriberActivityDocument>,
    @InjectModel('subscriberProgressHistory')
    private SubscriberProgressHistoryModel: Model<SubscriberProgressHistoryDocument>,
    @InjectModel('AssessmentResponse')
    private AssessmentResponseModel: Model<AssessmentResponseDocument>,
  ) {
    this.mongoClient = new MongoClient(process.env.MONGO_URL); // Initialize MongoClient
  }
  async onModuleInit() {
    const changeStream = this.SubscriberActivityModel.watch([
      {
        $match: { operationType: 'insert' },
      },
    ]);
    const updateStream = this.SubscriberProgressHistoryModel.watch([
      {
        $match: {
          operationType: 'update', // Only monitor updates
        },
      },
    ]);

    const assessmentStream = this.AssessmentResponseModel.watch();

    await this.mongoClient.connect();
    const db = this.mongoClient.db('ns-rewamp-backend');
    const userAssessmentsCollection = db.collection('userassessments');
    const userAssessmentsStream = userAssessmentsCollection.watch([], {
      fullDocument: 'updateLookup',
    });

    changeStream.on('change', (change) => {
      this.watchTypeService.handleDbEvent(change);
    });
    const processedUpdates: Set<string> = new Set();

    updateStream.on('change', async (change) => {
      const taskId = change.documentKey._id.toString();

      // Ignore changes if `taskCompleted` or `source` are modified
      const updatedFields = change.updateDescription?.updatedFields || {};
      if (
        updatedFields?.taskCompleted !== undefined || // Ignore `taskCompleted` changes
        updatedFields?.source === 'updateCompletedTask' // Ignore self-triggered updates
      ) {
        console.log(
          `Skipping taskCompleted or self-update for taskId: ${taskId}`,
        );
        return;
      }

      // Debounce logic: Skip if the document is already being processed
      if (processedUpdates.has(taskId)) {
        console.log(`Task ${taskId} is already being processed, skipping.`);
        return;
      }

      // Mark the document as being processed
      processedUpdates.add(taskId);

      try {
        console.log(`Processing change for taskId: ${taskId}`);
        await this.watchTypeService.UpdateDbEvent(change);
      } catch (error) {
        console.error(`Error processing change for taskId ${taskId}:`, error);
      } finally {
        // Remove the task from the cache after processing
        setTimeout(() => processedUpdates.delete(taskId), 500); // 500ms debounce duration
      }
    });
    assessmentStream.on('change', async (change) => {
      console.log('Detected change in assessments:', change);

      try {
        if (change.operationType === 'update') {
          const documentId = change.documentKey?._id;
          if (!documentId) {
            console.warn('No documentKey._id found in the change event');
            return;
          }

          // Fetch the updated document
          const assessmentResponse =
            await this.AssessmentResponseModel.findById(documentId);
          if (assessmentResponse) {
            await this.watchTypeService.AssessmentDbEvent(
              assessmentResponse.userId.toString(),
            );
          } else {
            console.warn(`Document with ID: ${documentId} not found`);
          }
        } else {
          console.warn(
            `Unhandled operation type in assessments: ${change.operationType}`,
          );
        }
      } catch (error) {
        console.error('Error handling change event in assessments:', error);
      }
    });

    userAssessmentsStream.on('change', async (change) => {
      console.log('Detected change in userassessments:', change);

      try {
        if (change.operationType === 'update') {
          const documentId = change.documentKey?._id;
          if (!documentId) {
            console.warn('No documentKey._id found in the change event');
            return;
          }
          // Fetch the updated document
          const userAssessment = await userAssessmentsCollection.findOne({
            _id: documentId,
          });
          if (userAssessment) {
            console.log(userAssessment, '-userAssessment.documentKey?');
            await this.watchTypeService.AssessmentDbEvent(
              userAssessment.user_id,
            );
          } else {
            console.warn(`Document with ID: ${documentId} not found`);
          }
        } else {
          console.warn(
            `Unhandled operation type in userassessments: ${change.operationType}`,
          );
        }
      } catch (error) {
        console.error('Error handling change event in userassessments:', error);
      }
    });

    // Error handlers
    userAssessmentsStream.on('error', (error) => {
      console.error('Error in userassessments watcher:', error);
    });

    console.log('Started watching userassessments collection.');
  }

  async onModuleDestroy() {
    await this.mongoClient.close(); // Ensure MongoDB connection is closed on module destroy
    console.log('MongoDB client connection closed.');
  }
}
