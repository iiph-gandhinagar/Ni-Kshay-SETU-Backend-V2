import {
  Controller,
  Post,
  Res,
  HttpStatus,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import * as k8s from '@kubernetes/client-node';

@ApiBearerAuth('access-token')
@ApiTags('cron-job')
@Controller('cron-job')
export class CronJobController {
  constructor(
    @Inject('BATCH_V1_API') private readonly k8sApi: k8s.BatchV1Api,
  ) {}
  @UseGuards(AdminAuthGuard)
  @Post('kbase-data-extractor')
  async triggerJob(@Res() res: Response) {
    try {
      const cronJobName = 'data-extractor-cronjob';
      const namespace = 'default';

      // Fetch the CronJob's spec to use it as a template
      const cronJob = await this.k8sApi.readNamespacedCronJob(
        cronJobName,
        namespace,
      );
      const jobSpec = cronJob.body.spec.jobTemplate;

      // Create a new Job using the CronJob's jobTemplate spec
      const newJob = {
        metadata: {
          generateName: `${cronJobName}-manual-`,
          namespace,
        },
        spec: jobSpec.spec,
      };

      const response = await this.k8sApi.createNamespacedJob(namespace, newJob);
      return res.status(HttpStatus.OK).json({
        message: 'Job triggered successfully',
        job: response.body,
      });
    } catch (error) {
      console.log('Error :-', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to trigger job',
        error: error.message,
      });
    }
  }

  @UseGuards(AdminAuthGuard)
  @Post('pinecone-vect')
  async triggerPineconeVectJob(@Res() res: Response) {
    try {
      const cronJobName = 'pinecone-vect-cronjob';
      const namespace = 'default';

      // Fetch the CronJob's spec to use it as a template
      const cronJob = await this.k8sApi.readNamespacedCronJob(
        cronJobName,
        namespace,
      );
      const jobSpec = cronJob.body.spec.jobTemplate;

      // Create a new Job using the CronJob's jobTemplate spec
      const newJob = {
        metadata: {
          generateName: `${cronJobName}-manual-`,
          namespace,
        },
        spec: jobSpec.spec,
      };

      const response = await this.k8sApi.createNamespacedJob(namespace, newJob);
      return res.status(HttpStatus.OK).json({
        message: 'Pinecone vectorization job triggered successfully',
        job: response.body,
      });
    } catch (error) {
      console.log('Error :-', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to trigger Pinecone vectorization job',
        error: error.message,
      });
    }
  }

  @UseGuards(AdminAuthGuard)
  @Post('delete-batches')
  async triggerDeleteBatchesJob(@Res() res: Response) {
    try {
      const cronJobName = 'delete-batches-cronjob';
      const namespace = 'default';

      // Fetch the CronJob's spec to use it as a template
      const cronJob = await this.k8sApi.readNamespacedCronJob(
        cronJobName,
        namespace,
      );
      const jobSpec = cronJob.body.spec.jobTemplate;

      // Create a new Job using the CronJob's jobTemplate spec
      const newJob = {
        metadata: {
          generateName: `${cronJobName}-manual-`,
          namespace,
        },
        spec: jobSpec.spec,
      };

      const response = await this.k8sApi.createNamespacedJob(namespace, newJob);
      return res.status(HttpStatus.OK).json({
        message: 'Delete batches job triggered successfully',
        job: response.body,
      });
    } catch (error) {
      console.log('Error :-', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to trigger delete batches job',
        error: error.message,
      });
    }
  }
}
