import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { EmailService } from 'src/common/mail/email.service';
import { BaseResponse } from 'src/common/utils/baseResponse';
import { FilterService } from 'src/common/utils/filterService';
import { InstituteSchema } from 'src/institute/entities/institute.entity';
import { TemporaryTokenSchema } from 'src/temporary-token/entities/temporary-token.entity';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUserSchema } from './entities/admin-user.entity';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AdminUser', schema: AdminUserSchema }]),
    MongooseModule.forFeature([
      { name: 'Institute', schema: InstituteSchema },
      { name: 'TemporaryToken', schema: TemporaryTokenSchema },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRY || '365d' },
    }),
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, BaseResponse, FilterService, EmailService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
