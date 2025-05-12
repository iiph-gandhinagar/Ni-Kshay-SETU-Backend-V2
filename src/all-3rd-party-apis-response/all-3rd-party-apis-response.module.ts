import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { All3rdPartyApisResponseController } from './all-3rd-party-apis-response.controller';
import { All3rdPartyApisResponseService } from './all-3rd-party-apis-response.service';
import { All3rdPartyApisResponseSchema } from './entities/all-3rd-party-apis-response.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'All3rdPartyApisResponse',
        schema: All3rdPartyApisResponseSchema,
      },
    ]),
  ],
  controllers: [All3rdPartyApisResponseController],
  providers: [All3rdPartyApisResponseService],
  exports: [All3rdPartyApisResponseService],
})
export class All3rdPartyApisResponseModule {}
