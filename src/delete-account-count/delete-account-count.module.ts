import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeleteAccountCountSchema } from './entities/delete-account-count.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DeleteAccountCount', schema: DeleteAccountCountSchema },
    ]),
  ],
})
export class DeleteAccountCountModule {}
