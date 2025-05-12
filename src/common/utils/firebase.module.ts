import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseService } from 'src/common/utils/FirebaseService';
import { UserDeviceTokenSchema } from 'src/user-device-token/entities/user-device-token.entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserDeviceToken', schema: UserDeviceTokenSchema },
    ]),
  ],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
