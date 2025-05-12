import { Module } from '@nestjs/common';
import { IpBlockerService } from './ipBlocker.service';

@Module({
  providers: [IpBlockerService],
  exports: [IpBlockerService], // Export it to be used in other modules
})
export class IpBlockerModule {}
