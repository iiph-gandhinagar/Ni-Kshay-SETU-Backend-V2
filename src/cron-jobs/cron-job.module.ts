import { Module } from '@nestjs/common';
import { CronJobController } from './cron-job.controller';
import * as k8s from '@kubernetes/client-node';

const batchV1ApiProvider = {
  provide: 'BATCH_V1_API',
  useFactory: () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    return kc.makeApiClient(k8s.BatchV1Api);
  },
};

@Module({
  controllers: [CronJobController],
  providers: [batchV1ApiProvider],
  exports: ['BATCH_V1_API'],
})
export class CronJobModule {}
