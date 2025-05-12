import { Module } from '@nestjs/common';
import { TemporaryTokenService } from './temporary-token.service';
import { TemporaryTokenController } from './temporary-token.controller';

@Module({
  controllers: [TemporaryTokenController],
  providers: [TemporaryTokenService],
})
export class TemporaryTokenModule {}
